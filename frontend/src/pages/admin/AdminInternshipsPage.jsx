import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  BriefcaseIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import axios from 'axios'

const AdminInternshipsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery(
    ['adminInternships', currentPage, searchTerm, statusFilter],
    async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await axios.get(`/admin/internships?${params}`)
      return response.data
    },
    { keepPreviousData: true }
  )

  const approveInternshipMutation = useMutation(
    async (internshipId) => {
      const response = await axios.put(`/admin/internships/${internshipId}/approve`)
      return response.data.internship
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminInternships')
      }
    }
  )

  const rejectInternshipMutation = useMutation(
    async ({ internshipId, reason }) => {
      const response = await axios.put(`/admin/internships/${internshipId}/reject`, { reason })
      return response.data.internship
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminInternships')
      }
    }
  )

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setStatusFilter('')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const handleApprove = (internshipId) => {
    if (window.confirm('Are you sure you want to approve this internship?')) {
      approveInternshipMutation.mutate(internshipId)
    }
  }

  const handleReject = (internshipId) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (reason) {
      rejectInternshipMutation.mutate({ internshipId, reason })
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Failed to load internships. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Internships</h1>
        <p className="mt-2 text-gray-600">Review and approve internship postings.</p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search internships by title, company, or skills..."
                className="input pl-10"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary btn-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleStatusFilter('')}
                className={`btn-sm ${
                  statusFilter === '' ? 'btn-primary' : 'btn-outline'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter('pending')}
                className={`btn-sm ${
                  statusFilter === 'pending' ? 'btn-warning' : 'btn-outline'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusFilter('approved')}
                className={`btn-sm ${
                  statusFilter === 'approved' ? 'btn-success' : 'btn-outline'
                }`}
              >
                Approved
              </button>
            </div>
            
            {(searchTerm || statusFilter) && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Internships List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.internships?.length > 0 ? (
        <>
          <div className="space-y-4">
            {data.internships.map((internship) => (
              <div key={internship._id} className="card hover:shadow-md transition-shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    {/* Internship Info */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        {/* Company Logo */}
                        <div className="flex-shrink-0">
                          {internship.companyLogo ? (
                            <img
                              src={internship.companyLogo}
                              alt={internship.company}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                              <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {internship.title}
                              </h3>
                              <p className="text-primary-600 font-medium">
                                {internship.company}
                              </p>
                              
                              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <BriefcaseIcon className="h-4 w-4 mr-1" />
                                  {internship.workType}
                                </div>
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  Posted {formatDate(internship.postedAt)}
                                </div>
                                <div className="flex items-center">
                                  <span className="text-sm">Applications:</span>
                                  <span className="font-medium ml-1">{internship.applicationsCount}</span>
                                </div>
                              </div>

                              {/* Skills */}
                              {internship.skills?.length > 0 && (
                                <div className="mt-3">
                                  <div className="flex flex-wrap gap-1">
                                    {internship.skills.slice(0, 4).map((skill, index) => (
                                      <span key={index} className="badge badge-primary text-xs">
                                        {skill}
                                      </span>
                                    ))}
                                    {internship.skills.length > 4 && (
                                      <span className="text-xs text-gray-500">
                                        +{internship.skills.length - 4} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Status and Actions */}
                            <div className="text-right">
                              <span className={`badge ${
                                internship.isApproved ? 'badge-success' : 'badge-warning'
                              }`}>
                                {internship.isApproved ? 'Approved' : 'Pending'}
                              </span>
                              
                              <div className="mt-3 space-y-2">
                                <Link
                                  to={`/student/internships/${internship._id}`}
                                  className="btn-outline btn-sm block w-full"
                                >
                                  <EyeIcon className="h-4 w-4 mr-1" />
                                  View Details
                                </Link>
                                
                                {!internship.isApproved && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleApprove(internship._id)}
                                      disabled={approveInternshipMutation.isLoading}
                                      className="btn-success btn-sm flex-1"
                                    >
                                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleReject(internship._id)}
                                      disabled={rejectInternshipMutation.isLoading}
                                      className="btn-error btn-sm flex-1"
                                    >
                                      <XCircleIcon className="h-4 w-4 mr-1" />
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Recruiter Info */}
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div>
                                Posted by: <span className="font-medium">{internship.recruiter?.username}</span>
                              </div>
                              <div>
                                Deadline: <span className="font-medium">{formatDate(internship.applicationDeadline)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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
                {data.pagination.total} internships
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
          <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters.
          </p>
          <button onClick={clearFilters} className="btn-primary">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminInternshipsPage
