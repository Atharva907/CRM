"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../utils/api';
import {
  CogIcon,
  BellIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const SystemConfiguration = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General settings
    siteName: 'CRM System',
    siteDescription: 'A powerful CRM for managing customers and sales',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',

    // Email settings
    smtpHost: '',
    smtpPort: '587',
    smtpSecure: true,
    smtpUser: '',
    smtpPassword: '',
    emailFrom: '',
    emailFromName: 'CRM System',

    // Notification settings
    emailNotifications: true,
    taskNotifications: true,
    dealNotifications: true,
    leadNotifications: true,

    // Security settings
    sessionTimeout: '24',
    passwordMinLength: '8',
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,

    // Backup settings
    autoBackup: true,
    backupFrequency: 'weekly',
    backupRetention: '30',
  });

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      const data = await response.json();

      if (response.ok) {
        setSettings(data.data);
      } else {
        console.error('Failed to fetch settings:', data.message);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle save settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await api.put('/admin/settings', settings);
      const data = await response.json();

      if (response.ok) {
        alert('Settings saved successfully');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('An error occurred while saving settings');
    } finally {
      setSaving(false);
    }
  };

  // Test email configuration
  const handleTestEmail = async () => {
    try {
      const response = await api.post('/admin/settings/test-email');
      const data = await response.json();

      if (response.ok) {
        alert('Test email sent successfully');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error testing email:', error);
      alert('An error occurred while testing email configuration');
    }
  };

  // Create backup
  const handleCreateBackup = async () => {
    try {
      const response = await api.post('/admin/settings/backup');
      const data = await response.json();

      if (response.ok) {
        alert('Backup created successfully');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('An error occurred while creating backup');
    }
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">General Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure general system settings.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                  Site Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="siteName"
                    name="siteName"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.siteName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                  Site Description
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="siteDescription"
                    name="siteDescription"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.siteDescription}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <div className="mt-1">
                  <select
                    id="timezone"
                    name="timezone"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.timezone}
                    onChange={handleChange}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700">
                  Date Format
                </label>
                <div className="mt-1">
                  <select
                    id="dateFormat"
                    name="dateFormat"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.dateFormat}
                    onChange={handleChange}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="timeFormat" className="block text-sm font-medium text-gray-700">
                  Time Format
                </label>
                <div className="mt-1">
                  <select
                    id="timeFormat"
                    name="timeFormat"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.timeFormat}
                    onChange={handleChange}
                  >
                    <option value="12h">12-hour</option>
                    <option value="24h">24-hour</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Email Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure email settings for notifications and system emails.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700">
                  SMTP Host
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="smtpHost"
                    name="smtpHost"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.smtpHost}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700">
                  SMTP Port
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="smtpPort"
                    name="smtpPort"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.smtpPort}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="smtpSecure"
                      name="smtpSecure"
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={settings.smtpSecure}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="smtpSecure" className="font-medium text-gray-700">
                      Use SSL/TLS
                    </label>
                    <p className="text-gray-500">Enable secure connection to SMTP server</p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700">
                  SMTP Username
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="smtpUser"
                    name="smtpUser"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.smtpUser}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700">
                  SMTP Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    id="smtpPassword"
                    name="smtpPassword"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.smtpPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="emailFrom" className="block text-sm font-medium text-gray-700">
                  From Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="emailFrom"
                    name="emailFrom"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.emailFrom}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="emailFromName" className="block text-sm font-medium text-gray-700">
                  From Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="emailFromName"
                    name="emailFromName"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.emailFromName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleTestEmail}
                >
                  <EnvelopeIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Test Email
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Notification Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure system notifications.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="emailNotifications"
                    name="emailNotifications"
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                    Email Notifications
                  </label>
                  <p className="text-gray-500">Receive email notifications for important events</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="taskNotifications"
                    name="taskNotifications"
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    checked={settings.taskNotifications}
                    onChange={handleChange}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="taskNotifications" className="font-medium text-gray-700">
                    Task Notifications
                  </label>
                  <p className="text-gray-500">Receive notifications for task assignments and updates</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="dealNotifications"
                    name="dealNotifications"
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    checked={settings.dealNotifications}
                    onChange={handleChange}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="dealNotifications" className="font-medium text-gray-700">
                    Deal Notifications
                  </label>
                  <p className="text-gray-500">Receive notifications for deal updates</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="leadNotifications"
                    name="leadNotifications"
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    checked={settings.leadNotifications}
                    onChange={handleChange}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="leadNotifications" className="font-medium text-gray-700">
                    Lead Notifications
                  </label>
                  <p className="text-gray-500">Receive notifications for new leads and lead updates</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Security Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure security settings for the CRM.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">
                  Session Timeout (hours)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="sessionTimeout"
                    name="sessionTimeout"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.sessionTimeout}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="passwordMinLength" className="block text-sm font-medium text-gray-700">
                  Minimum Password Length
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="passwordMinLength"
                    name="passwordMinLength"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.passwordMinLength}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="passwordRequireUppercase"
                      name="passwordRequireUppercase"
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={settings.passwordRequireUppercase}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="passwordRequireUppercase" className="font-medium text-gray-700">
                      Require Uppercase Letters
                    </label>
                    <p className="text-gray-500">Passwords must contain at least one uppercase letter</p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="passwordRequireNumbers"
                      name="passwordRequireNumbers"
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={settings.passwordRequireNumbers}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="passwordRequireNumbers" className="font-medium text-gray-700">
                      Require Numbers
                    </label>
                    <p className="text-gray-500">Passwords must contain at least one number</p>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="passwordRequireSpecialChars"
                      name="passwordRequireSpecialChars"
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={settings.passwordRequireSpecialChars}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="passwordRequireSpecialChars" className="font-medium text-gray-700">
                      Require Special Characters
                    </label>
                    <p className="text-gray-500">Passwords must contain at least one special character</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">Backup Settings</h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure backup settings for the CRM.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="autoBackup"
                      name="autoBackup"
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      checked={settings.autoBackup}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="autoBackup" className="font-medium text-gray-700">
                      Automatic Backups
                    </label>
                    <p className="text-gray-500">Enable automatic backups of the CRM data</p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="backupFrequency" className="block text-sm font-medium text-gray-700">
                  Backup Frequency
                </label>
                <div className="mt-1">
                  <select
                    id="backupFrequency"
                    name="backupFrequency"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.backupFrequency}
                    onChange={handleChange}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="backupRetention" className="block text-sm font-medium text-gray-700">
                  Backup Retention (days)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="backupRetention"
                    name="backupRetention"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={settings.backupRetention}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={handleCreateBackup}
                >
                  <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Create Backup Now
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">System Configuration</h1>
          <p className="mt-2 text-sm text-gray-700">
            Configure system settings, email, notifications, security, and backup options.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'general', name: 'General', icon: CogIcon },
              { id: 'email', name: 'Email', icon: EnvelopeIcon },
              { id: 'notifications', name: 'Notifications', icon: BellIcon },
              { id: 'security', name: 'Security', icon: ShieldCheckIcon },
              { id: 'backup', name: 'Backup', icon: DocumentTextIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <tab.icon
                  className={`${
                    activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                  } -ml-0.5 mr-2 h-5 w-5`}
                  aria-hidden="true"
                />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <form onSubmit={handleSaveSettings} className="mt-6 space-y-6">
        {renderTabContent()}

        {/* Save Button */}
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SystemConfiguration;
