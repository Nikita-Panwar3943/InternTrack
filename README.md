# Student Internship & Skill Tracker

A complete MERN stack application for tracking student internships and skills with role-based access control.

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT + bcrypt
- **Deployment**: Vercel (Frontend), Render (Backend)

## Features

### Student Module
- Registration & Login with JWT authentication
- Profile management with skills tracking
- Skill assessment quizzes
- Internship browsing and application tracking
- Resume upload capability

### Admin Module
- Admin dashboard with analytics
- Student management
- Internship approval/rejection
- Skills distribution insights

### Recruiter Module
- Internship posting and management
- Applicant review and status updates
- Application tracking

## Project Structure

```
Project2/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Quick Start

### Backend Setup
1. Navigate to `backend/`
2. Install dependencies: `npm install`
3. Create `.env` file with MongoDB Atlas connection
4. Run: `npm run dev`

### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run: `npm run dev`

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Deployment

### Backend (Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy with Node.js build command

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables
3. Deploy with Vite build command

## API Endpoints

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`

### Students
- GET `/api/students/profile`
- PUT `/api/students/profile`
- POST `/api/students/skills`
- GET `/api/students/internships`

### Admin
- GET `/api/admin/analytics`
- GET `/api/admin/students`
- PUT `/api/admin/internships/:id/approve`

### Internships
- GET `/api/internships`
- POST `/api/internships`
- GET `/api/internships/:id`
- PUT `/api/internships/:id`

## License

MIT License
