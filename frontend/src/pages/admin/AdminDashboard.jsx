import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChartBarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import axios from 'axios'

const AdminDashboard = () => {
  const { user } = useAuth()

  const { data: analytics, isLoading } = useQuery(
    'adminAnalytics',
    async () => {
      const response = await axios.get('/admin/analytics')
      return response.data.analytics
    },
    { enabled: !!user }
  )

  const statCards = [
    {
      name: 'Total Students',
      value: analytics?.overview?.totalStudents || 0,
      icon: AcademicCapIcon,
      color: 'bg-blue-500',
      link: '/admin/students'
    },
    {
      name: 'Total Recruiters',
      value: analytics?.overview?.totalRecruiters || 0,
      icon: BuildingOfficeIcon,
      color: 'bg-green-500',
      link: '/admin/recruiters'
    },
    {
      name: 'Total Internships',
      value: analytics?.overview?.totalInternships || 0,
      icon: BriefcaseIcon,
      color: 'bg-purple-500',
      link: '/admin/internships'
    },
    {
      name: 'Total Applications',
      value: analytics?.overview?.totalApplications || 0,
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
      link: '/admin/applications'
    }
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Manage students, recruiters, and monitor platform activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending Approvals */}
      {analytics?.overview?.pendingInternships > 0 && (
        <div className="card border-l-4 border-yellow-500">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Pending Internship Approvals
              </h3>
              <Link
                to="/admin/internships?status=pending"
                className="btn-warning"
              >
                Review Now
              </Link>
            </div>
          </div>
          <div className="card-body">
            <p className="text-yellow-700">
              You have {analytics.overview.pendingInternships} internship(s) waiting for approval.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Students */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Students</h3>
              <Link
                to="/admin/students"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="card-body">
            {analytics?.recentStudents?.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentStudents.map((student) => (
                  <div key={student._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{student.username}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="badge badge-secondary">Student</span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent student registrations</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Students */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Students</h3>
          </div>
          <div className="card-body">
            {analytics?.topStudents?.length > 0 ? (
              <div className="space-y-4">
                {analytics.topStudents.map((student, index) => (
                  <div key={student._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.username}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        {student.totalScore}
                      </div>
                      <p className="text-xs text-gray-500">Total Score</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No student performance data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Statistics */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Application Statistics</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analytics?.applicationStats?.map((stat) => (
              <div key={stat._id} className="text-center">
                <div className={`text-3xl font-bold ${
                  stat._id === 'selected' ? 'text-green-600' :
                  stat._id === 'shortlisted' ? 'text-yellow-600' :
                  stat._id === 'rejected' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {stat.count}
                </div>
                <p className="text-sm text-gray-600 capitalize">{stat._id}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Distribution */}
      {analytics?.skillsDistribution?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Popular Skills</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.skillsDistribution.slice(0, 6).map((skill) => (
                <div key={skill._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{skill._id}</p>
                    <p className="text-sm text-gray-600">{skill.count} students</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary-600">
                      {Math.round(skill.averageScore)}%
                    </div>
                    <p className="text-xs text-gray-500">Avg Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/students"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <UserGroupIcon className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-primary-600 font-medium">Manage Students</span>
            </Link>
            <Link
              to="/admin/recruiters"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <BuildingOfficeIcon className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-primary-600 font-medium">Manage Recruiters</span>
            </Link>
            <Link
              to="/admin/internships"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <BriefcaseIcon className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-primary-600 font-medium">Review Internships</span>
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <ChartBarIcon className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-primary-600 font-medium">View Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
