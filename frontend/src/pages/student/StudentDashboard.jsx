import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import axios from 'axios'

const StudentDashboard = () => {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery(
    'studentStats',
    async () => {
      const response = await axios.get('/api/students/stats')
      return response.data.stats
    },
    { enabled: !!user }
  )

  const { data: recentApplications } = useQuery(
    'recentApplications',
    async () => {
      const response = await axios.get('/api/students/applications?limit=5')
      return response.data.applications
    },
    { enabled: !!user }
  )

  const { data: featuredInternships } = useQuery(
    'featuredInternships',
    async () => {
      const response = await axios.get('/api/internships/featured?limit=3')
      return response.data.internships
    }
  )

  const statCards = [
    {
      name: 'Total Applications',
      value: stats?.totalApplications || 0,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      link: '/student/applications'
    },
    {
      name: 'Shortlisted',
      value: stats?.shortlistedApplications || 0,
      icon: ChartBarIcon,
      color: 'bg-green-500',
      link: '/student/applications?status=shortlisted'
    },
    {
      name: 'Skills Tracked',
      value: stats?.totalSkills || 0,
      icon: AcademicCapIcon,
      color: 'bg-purple-500',
      link: '/student/skills'
    },
    {
      name: 'Selected',
      value: stats?.selectedApplications || 0,
      icon: BriefcaseIcon,
      color: 'bg-yellow-500',
      link: '/student/applications?status=selected'
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
          Welcome back, {user?.username}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your internship journey and skill progress.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              <Link
                to="/student/applications"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="card-body">
            {recentApplications?.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {application.internship?.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {application.internship?.company}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${
                        application.status === 'selected' ? 'badge-success' :
                        application.status === 'shortlisted' ? 'badge-warning' :
                        application.status === 'rejected' ? 'badge-error' :
                        'badge-secondary'
                      }`}>
                        {application.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No applications yet</p>
                <Link
                  to="/student/internships"
                  className="btn-primary mt-4 inline-flex items-center"
                >
                  Browse Internships
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Featured Internships */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Featured Internships</h3>
              <Link
                to="/student/internships"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="card-body">
            {featuredInternships?.length > 0 ? (
              <div className="space-y-4">
                {featuredInternships.map((internship) => (
                  <div key={internship._id} className="border-l-4 border-primary-500 pl-4">
                    <Link
                      to={`/student/internships/${internship._id}`}
                      className="block hover:bg-gray-50"
                    >
                      <p className="font-medium text-gray-900 hover:text-primary-600">
                        {internship.title}
                      </p>
                      <p className="text-sm text-gray-600">{internship.company}</p>
                      <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                        <span>{internship.location}</span>
                        <span>{internship.workType}</span>
                        {internship.isPaid && <span className="text-green-600">Paid</span>}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No featured internships available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/student/internships"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <PlusIcon className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-primary-600 font-medium">Browse Internships</span>
            </Link>
            <Link
              to="/student/skills"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <PlusIcon className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-primary-600 font-medium">Update Skills</span>
            </Link>
            <Link
              to="/student/profile"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <PlusIcon className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-primary-600 font-medium">Edit Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Skills Overview */}
      {stats && stats.averageSkillScore > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Skills Overview</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {Math.round(stats.averageSkillScore)}%
                </div>
                <p className="text-sm text-gray-600">Average Skill Score</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats.assessedSkills}
                </div>
                <p className="text-sm text-gray-600">Skills Assessed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.totalAssessments}
                </div>
                <p className="text-sm text-gray-600">Total Assessments</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard
