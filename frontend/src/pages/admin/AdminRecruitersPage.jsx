import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  EyeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import axios from 'axios'

const AdminRecruitersPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    company: '',
    isVerified: ''
  })
  const [currentPage, setCurrentPage] = useState(1)

  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery(
    ['adminRecruiters', currentPage, searchTerm, filters],
    async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.company && { company: filters.company }),
        ...(filters.isVerified !== '' && { isVerified: filters.isVerified })
      })
      
      const response = await axios.get(`/admin/recruiters?${params}`)
      return response.data
    },
    { keepPreviousData: true }
  )

  const verifyRecruiterMutation = useMutation(
    async (userId) => {
      const response = await axios.put(`/admin/recruiters/${userId}/verify`)
      return response.data.profile
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminRecruiters')
      }
    }
  )

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({ company: '', isVerified: '' })
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

  const handleVerify = (userId) => {
    if (window.confirm('Are you sure you want to verify this recruiter?')) {
      verifyRecruiterMutation.mutate(userId)
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Failed to load recruiters. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Recruiters</h1>
        <p className="mt-2 text-gray-600">View and manage all recruiter accounts.</p>
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
                placeholder="Search recruiters by name or email..."
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

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                placeholder="Company name"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Status
              </label>
              <select
                value={filters.isVerified}
                onChange={(e) => handleFilterChange('isVerified', e.target.value)}
                className="input"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>
          </div>

          {(searchTerm || Object.values(filters).some(v => v)) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {data?.recruiters?.length || 0} results
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recruiters List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.recruiters?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.recruiters.map((recruiter) => (
              <div key={recruiter._id} className="card hover:shadow-lg transition-shadow">
                <div className="card-body">
                  {/* Recruiter Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {recruiter.avatar ? (
                        <img
                          src={recruiter.avatar}
                          alt={recruiter.fullName}
                          className="w-12 h-12 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <UserGroupIcon className="h-6 w-6 text-primary-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {recruiter.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">{recruiter.user.email}</p>
                      </div>
                    </div>
                    
                    {/* Verification Badge */}
                    <span className={`badge ${
                      recruiter.isVerified ? 'badge-success' : 'badge-warning'
                    }`}>
                      {recruiter.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>

                  {/* Recruiter Info */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Company:</span> {recruiter.company}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Position:</span> {recruiter.position}
                      </p>
                    </div>
                    
                    {recruiter.industry && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Industry:</span> {recruiter.industry}
                      </div>
                    )}

                    {recruiter.companySize && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Company Size:</span> {recruiter.companySize}
                      </div>
                    )}

                    {recruiter.bio && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Bio:</span>
                        <p className="line-clamp-2 mt-1">{recruiter.bio}</p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t">
                      <div>
                        <div className="text-lg font-bold text-primary-600">
                          {recruiter.stats.internshipsPosted}
                        </div>
                        <p className="text-xs text-gray-600">Posted</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {recruiter.stats.applicationsReceived}
                        </div>
                        <p className="text-xs text-gray-600">Applications</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">
                          {recruiter.stats.candidatesHired}
                        </div>
                        <p className="text-xs text-gray-600">Hired</p>
                      </div>
                    </div>

                    {/* Joined Date */}
                    <div className="flex items-center text-xs text-gray-500 pt-3 border-t">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Joined {formatDate(recruiter.user.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/recruiters/${recruiter._id}`}
                        className="btn-outline btn-sm"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </div>
                    
                    {!recruiter.isVerified && (
                      <button
                        onClick={() => handleVerify(recruiter.user._id)}
                        disabled={verifyRecruiterMutation.isLoading}
                        className="btn-success btn-sm"
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Verify
                      </button>
                    )}
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
                {data.pagination.total} recruiters
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
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recruiters found</h3>
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

export default AdminRecruitersPage
