import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { 
  DocumentTextIcon,
  FunnelIcon,
  EyeIcon,
  CalendarIcon,
  BriefcaseIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import axios from 'axios'

const ApplicationsPage = () => {
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading, error } = useQuery(
    ['studentApplications', currentPage, statusFilter],
    async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await axios.get(`/students/applications?${params}`)
      return response.data
    },
    { keepPreviousData: true }
  )

  const statusColors = {
    applied: 'badge-secondary',
    shortlisted: 'badge-warning',
    interview: 'badge-primary',
    rejected: 'badge-error',
    selected: 'badge-success',
    withdrawn: 'badge-secondary'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Failed to load applications. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="mt-2 text-gray-600">Track the status of your internship applications.</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                <label className="text-sm font-medium text-gray-700">Status:</label>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="input text-sm"
              >
                <option value="">All Status</option>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            
            {data?.applications?.length > 0 && (
              <div className="text-sm text-gray-600">
                Showing {data.applications.length} applications
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.applications?.length > 0 ? (
        <>
          <div className="space-y-4">
            {data.applications.map((application) => (
              <div key={application._id} className="card hover:shadow-md transition-shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    {/* Left Content */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        {/* Company Logo/Avatar */}
                        <div className="flex-shrink-0">
                          {application.internship?.companyLogo ? (
                            <img
                              src={application.internship.companyLogo}
                              alt={application.internship.company}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                              <BriefcaseIcon className="h-6 w-6 text-primary-600" />
                            </div>
                          )}
                        </div>

                        {/* Application Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                                <Link to={`/student/internships/${application.internship._id}`}>
                                  {application.internship?.title}
                                </Link>
                              </h3>
                              <p className="text-primary-600 font-medium">
                                {application.internship?.company}
                              </p>
                              
                              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <MapPinIcon className="h-4 w-4 mr-1" />
                                  {application.internship?.location}
                                </div>
                                <div className="flex items-center">
                                  <BriefcaseIcon className="h-4 w-4 mr-1" />
                                  {application.internship?.workType}
                                </div>
                                {application.internship?.isPaid && (
                                  <span className="badge badge-success">Paid</span>
                                )}
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="text-right">
                              <span className={`badge ${statusColors[application.status]}`}>
                                {getStatusText(application.status)}
                              </span>
                            </div>
                          </div>

                          {/* Cover Letter Preview */}
                          {application.coverLetter && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700 line-clamp-2">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}

                          {/* Timeline */}
                          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              Applied on {formatDate(application.appliedAt)}
                            </div>
                            {application.lastUpdated !== application.appliedAt && (
                              <div>
                                Last updated {formatDate(application.lastUpdated)}
                              </div>
                            )}
                          </div>

                          {/* Interview Schedule */}
                          {application.interviewSchedule && (
                            <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                              <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 text-primary-600 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-primary-900">
                                    Interview Scheduled
                                  </p>
                                  <p className="text-sm text-primary-700">
                                    {new Date(application.interviewSchedule.date).toLocaleDateString()} at {application.interviewSchedule.time}
                                  </p>
                                  {application.interviewSchedule.location && (
                                    <p className="text-sm text-primary-700">
                                      {application.interviewSchedule.location}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Notes from Recruiter */}
                          {application.notes?.length > 0 && (
                            <div className="mt-3">
                              <details className="group">
                                <summary className="cursor-pointer text-sm text-primary-600 hover:text-primary-700">
                                  View recruiter notes ({application.notes.length})
                                </summary>
                                <div className="mt-2 space-y-2">
                                  {application.notes.map((note, index) => (
                                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                                      <p className="text-gray-700">{note.content}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(note.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex flex-col space-y-2">
                      <Link
                        to={`/student/internships/${application.internship._id}`}
                        className="btn-outline btn-sm"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      
                      {application.status === 'applied' && (
                        <button className="btn-outline btn-sm text-error-600 hover:text-error-700">
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} applications
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={data.pagination.page === 1}
                  className="btn-outline btn-sm disabled:opacity-50"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {data.pagination.page} of {data.pagination.pages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.pagination.pages))}
                  disabled={data.pagination.page === data.pagination.pages}
                  className="btn-outline btn-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600 mb-4">
            Start applying to internships to track your applications here.
          </p>
          <Link
            to="/student/internships"
            className="btn-primary"
          >
            Browse Internships
          </Link>
        </div>
      )}

      {/* Statistics */}
      {data?.applications?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Application Statistics</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(
                data.applications.reduce((acc, app) => {
                  acc[app.status] = (acc[app.status] || 0) + 1
                  return acc
                }, {})
              ).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className={`text-2xl font-bold ${
                    status === 'selected' ? 'text-green-600' :
                    status === 'shortlisted' ? 'text-yellow-600' :
                    status === 'interview' ? 'text-blue-600' :
                    status === 'rejected' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {count}
                  </div>
                  <p className="text-sm text-gray-600 capitalize">{getStatusText(status)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicationsPage
