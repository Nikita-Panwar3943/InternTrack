import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  BriefcaseIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EyeIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import axios from 'axios'

const RecruiterDashboard = () => {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery(
    'recruiterStats',
    async () => {
      const response = await axios.get('/recruiters/stats')
      return response.data.stats
    },
    { enabled: !!user }
  )

  const { data: recentApplications } = useQuery(
    'recentApplications',
    async () => {
      const response = await axios.get('/recruiters/applications?limit=5')
      return response.data.applications
    },
    { enabled: !!user }
  )

  const { data: recentInternships } = useQuery(
    'recentInternships',
    async () => {
      const response = await axios.get('/recruiters/internships?limit=3')
      return response.data.internships
    },
    { enabled: !!user }
  )

  const statCards = [
    {
      name: 'Total Internships',
      value: stats?.totalInternships || 0,
      icon: BriefcaseIcon,
      color: 'bg-blue-500',
      link: '/recruiter/internships'
    },
    {
      name: 'Total Applications',
      value: stats?.totalApplications || 0,
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      link: '/recruiter/applicants'
    },
    {
      name: 'Total Views',
      value: stats?.totalViews || 0,
      icon: EyeIcon,
      color: 'bg-purple-500',
      link: '/recruiter/internships'
    },
    {
      name: 'Candidates Hired',
      value: stats?.selectedApplications || 0,
      icon: UserGroupIcon,
      color: 'bg-yellow-500',
      link: '/recruiter/applicants?status=selected'
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
          Recruiter Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your internships and track applications from talented students.
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

      {/* Pending Applications Alert */}
      {stats?.pendingApplications > 0 && (
        <div className="card border-l-4 border-yellow-500">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Pending Applications
              </h3>
              <Link
                to="/recruiter/applicants?status=applied"
                className="btn-warning"
              >
                Review Applications
              </Link>
            </div>
          </div>
          <div className="card-body">
            <p className="text-yellow-700">
              You have {stats.pendingApplications} application(s) waiting for your review.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
              <Link
                to="/recruiter/applicants"
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
                        {application.student?.profile?.firstName} {application.student?.profile?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {application.internship?.title}
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
                  to="/recruiter/internships"
                  className="btn-primary mt-4 inline-flex items-center"
                >
                  Post Internship
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Internships */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Internships</h3>
              <Link
                to="/recruiter/internships"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="card-body">
            {recentInternships?.length > 0 ? (
              <div className="space-y-4">
                {recentInternships.map((internship) => (
                  <div key={internship._id} className="border-l-4 border-primary-500 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{internship.title}</p>
                        <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                          <span>{internship.location}</span>
                          <span>{internship.workType}</span>
                          <span>{internship.applicationsCount} applications</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`badge ${
                          internship.isApproved ? 'badge-success' : 'badge-warning'
                        }`}>
                          {internship.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No internships posted yet</p>
                <Link
                  to="/recruiter/internships"
                  className="btn-primary mt-4 inline-flex items-center"
                >
                  Post Your First Internship
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      {stats && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {stats.activeInternships}
                </div>
                <p className="text-sm text-gray-600">Active Internships</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {stats.shortlistedApplications}
                </div>
                <p className="text-sm text-gray-600">Shortlisted Candidates</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.pendingInternships}
                </div>
                <p className="text-sm text-gray-600">Pending Approval</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.candidatesHired}
                </div>
                <p className="text-sm text-gray-600">Total Hired</p>
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/recruiter/internships"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <PlusIcon className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-primary-600 font-medium">Post New Internship</span>
            </Link>
            <Link
              to="/recruiter/applicants"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <UserGroupIcon className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-primary-600 font-medium">Review Applications</span>
            </Link>
            <Link
              to="/recruiter/profile"
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <ChartBarIcon className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-primary-600 font-medium">Update Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecruiterDashboard
