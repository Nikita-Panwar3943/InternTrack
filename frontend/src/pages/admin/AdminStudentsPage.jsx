import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  AcademicCapIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import axios from 'axios'

const AdminStudentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    skills: '',
    location: ''
  })
  const [currentPage, setCurrentPage] = useState(1)

  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery(
    ['adminStudents', currentPage, searchTerm, filters],
    async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.skills && { skills: filters.skills }),
        ...(filters.location && { location: filters.location })
      })
      
      const response = await axios.get(`/admin/students?${params}`)
      return response.data
    },
    { keepPreviousData: true }
  )

  const toggleUserStatusMutation = useMutation(
    async (userId) => {
      const response = await axios.put(`/admin/users/${userId}/toggle-status`)
      return response.data.user
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminStudents')
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
    setFilters({ skills: '', location: '' })
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Failed to load students. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
        <p className="mt-2 text-gray-600">View and manage all student accounts.</p>
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
                placeholder="Search students by name or email..."
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
                Skills
              </label>
              <input
                type="text"
                value={filters.skills}
                onChange={(e) => handleFilterChange('skills', e.target.value)}
                placeholder="e.g., JavaScript, Python"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="City or country"
                className="input"
              />
            </div>
          </div>

          {(searchTerm || Object.values(filters).some(v => v)) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {data?.students?.length || 0} results
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

      {/* Students List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : data?.students?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.students.map((student) => (
              <div key={student._id} className="card hover:shadow-lg transition-shadow">
                <div className="card-body">
                  {/* Student Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.fullName}
                          className="w-12 h-12 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <UserGroupIcon className="h-6 w-6 text-primary-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {student.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">{student.user.email}</p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`badge ${
                      student.user.isActive ? 'badge-success' : 'badge-error'
                    }`}>
                      {student.user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Student Info */}
                  <div className="space-y-3">
                    {student.location && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {student.location}
                      </div>
                    )}
                    
                    {student.bio && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Bio:</span>
                        <p className="line-clamp-2 mt-1">{student.bio}</p>
                      </div>
                    )}

                    {/* Skills */}
                    {student.skills?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {student.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="badge badge-primary text-xs">
                              {skill.name}
                            </span>
                          ))}
                          {student.skills.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{student.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t">
                      <div>
                        <div className="text-lg font-bold text-primary-600">
                          {student.stats.applicationsCount}
                        </div>
                        <p className="text-xs text-gray-600">Applications</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {student.stats.shortlistedCount}
                        </div>
                        <p className="text-xs text-gray-600">Shortlisted</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">
                          {student.stats.selectedCount}
                        </div>
                        <p className="text-xs text-gray-600">Selected</p>
                      </div>
                    </div>

                    {/* Joined Date */}
                    <div className="flex items-center text-xs text-gray-500 pt-3 border-t">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Joined {formatDate(student.user.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/students/${student._id}`}
                        className="btn-outline btn-sm"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </div>
                    
                    <button
                      onClick={() => toggleUserStatusMutation.mutate(student.user._id)}
                      className={`btn-sm ${
                        student.user.isActive 
                          ? 'text-error-600 hover:text-error-700' 
                          : 'text-success-600 hover:text-success-700'
                      }`}
                    >
                      {student.user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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
                {data.pagination.total} students
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
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

export default AdminStudentsPage
