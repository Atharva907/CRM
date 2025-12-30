# CRM System

A production-ready Customer Relationship Management (CRM) system built with modern web technologies.

## Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **Charts**: Recharts
- **Deployment**: Docker

## Features

- Authentication & Authorization with role-based access
- Leads Management with Kanban-style pipeline
- Customer Management
- Deal & Sales Tracking
- Tasks & Follow-Ups
- Reports & Analytics

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB 7+
- Docker (optional)

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

### Environment Variables

Create `.env` files in both frontend and backend directories with the following variables:

#### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/crm
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Running the Application

1. Start MongoDB
2. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
3. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

### Using Docker

```bash
docker-compose up
```

## Project Structure

```
CRM/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── .env
│   ├── .gitignore
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── context/
│   │   └── App.js
│   ├── public/
│   ├── .env
│   ├── .gitignore
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Development Phases

1. **Phase 1**: Requirements + Architecture
2. **Phase 2**: Database & Auth
3. **Phase 3**: Leads & Customers
4. **Phase 4**: Deals & Tasks
5. **Phase 5**: Dashboard & Reports
6. **Phase 6**: Security & Optimization
7. **Phase 7**: Deployment & Documentation
