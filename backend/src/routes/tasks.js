const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');

// @route   GET api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, search } = req.query;
    const query = { assignedTo: req.user.id };
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Filter by priority if provided
    if (priority) {
      query.priority = priority;
    }
    
    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('relatedToLeadId', 'name')
      .populate('relatedToCustomerId', 'name')
      .populate('relatedToDealId', 'title');
      
    const total = await Task.countDocuments(query);
    
    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('relatedToLeadId', 'name email')
      .populate('relatedToCustomerId', 'name email')
      .populate('relatedToDealId', 'title');
    
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    
    // Check if user is authorized to view this task
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/tasks
// @desc    Create a task
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      dueDate, 
      priority, 
      status,
      relatedToLeadId,
      relatedToCustomerId,
      relatedToDealId
    } = req.body;
    
    // Simple validation
    if (!title) {
      return res.status(400).json({ msg: 'Title is required' });
    }
    
    const newTask = new Task({
      title,
      description,
      dueDate,
      priority,
      status,
      relatedToLeadId,
      relatedToCustomerId,
      relatedToDealId,
      assignedTo: req.user.id
    });
    
    const task = await newTask.save();
    await task.populate([
      { path: 'relatedToLeadId', select: 'name' },
      { path: 'relatedToCustomerId', select: 'name' },
      { path: 'relatedToDealId', select: 'title' }
    ]);
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      dueDate, 
      priority, 
      status,
      completedAt
    } = req.body;
    
    // Find task
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    
    // Check if user is authorized to update this task
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (status) {
      task.status = status;
      // If task is marked as completed, set completedAt timestamp
      if (status === 'completed' && !task.completedAt) {
        task.completedAt = Date.now();
      }
      // If task is being moved from completed to another status, clear completedAt
      else if (status !== 'completed' && task.completedAt) {
        task.completedAt = null;
      }
    }
    if (completedAt !== undefined) task.completedAt = completedAt;
    
    task.updatedAt = Date.now();
    
    await task.save();
    await task.populate([
      { path: 'relatedToLeadId', select: 'name' },
      { path: 'relatedToCustomerId', select: 'name' },
      { path: 'relatedToDealId', select: 'title' }
    ]);
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    
    // Check if user is authorized to delete this task
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
