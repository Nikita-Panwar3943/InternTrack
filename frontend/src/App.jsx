import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import ProfilePage from './pages/student/ProfilePage'
import SkillsPage from './pages/student/SkillsPage'
import InternshipsPage from './pages/student/InternshipsPage'
import ApplicationsPage from './pages/student/ApplicationsPage'
import InternshipDetailsPage from './pages/student/InternshipDetailsPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStudentsPage from './pages/admin/AdminStudentsPage'
import AdminInternshipsPage from './pages/admin/AdminInternshipsPage'
import AdminRecruitersPage from './pages/admin/AdminRecruitersPage'

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import RecruiterProfilePage from './pages/recruiter/RecruiterProfilePage'
import RecruiterInternshipsPage from './pages/recruiter/RecruiterInternshipsPage'
import RecruiterApplicantsPage from './pages/recruiter/RecruiterApplicantsPage'

// Public pages
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

// Public Route component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (user) {
    // Redirect to role-based dashboard
    const dashboardPath = `/${user.role}/dashboard`
    return <Navigate to={dashboardPath} replace />
  }

  return children
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          
          {/* Auth routes */}
          <Route
            path="login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Student routes */}
          <Route
            path="student/*"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentRoutes />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminRoutes />
              </ProtectedRoute>
            }
          />

          {/* Recruiter routes */}
          <Route
            path="recruiter/*"
            element={
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterRoutes />
              </ProtectedRoute>
            }
          />

          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </div>
  )
}

// Student routes component
function StudentRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="skills" element={<SkillsPage />} />
      <Route path="internships" element={<InternshipsPage />} />
      <Route path="internships/:id" element={<InternshipDetailsPage />} />
      <Route path="applications" element={<ApplicationsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

// Admin routes component
function AdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="students" element={<AdminStudentsPage />} />
      <Route path="internships" element={<AdminInternshipsPage />} />
      <Route path="recruiters" element={<AdminRecruitersPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

// Recruiter routes component
function RecruiterRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<RecruiterDashboard />} />
      <Route path="profile" element={<RecruiterProfilePage />} />
      <Route path="internships" element={<RecruiterInternshipsPage />} />
      <Route path="applicants" element={<RecruiterApplicantsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
