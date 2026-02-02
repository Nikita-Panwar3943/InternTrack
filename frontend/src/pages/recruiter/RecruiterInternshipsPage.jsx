import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BriefcaseIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import axios from 'axios'

const RecruiterInternshipsPage = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [editingInternship, setEditingInternship] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data, isLoading, error } = useQuery(
    ['recruiterInternships', currentPage, searchTerm, statusFilter],
    async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      })
      
      const response = await axios.get(`/recruiters/internships?${params}`)
      return response.data
    },
    { keepPreviousData: true }
  )

  const createInternshipMutation = useMutation(
    async (internshipData) => {
      const response = await axios.post('/recruiters/internships', internshipData)
      return response.data.internship
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recruiterInternships')
        queryClient.invalidateQueries('recruiterStats')
        setIsCreating(false)
        reset()
      }
    }
  )

  const updateInternshipMutation = useMutation(
    async ({ id, data }) => {
      const response = await axios.put(`/recruiters/internships/${id}`, data)
      return response.data.internship
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recruiterInternships')
        setEditingInternship(null)
        reset()
      }
    }
  )

  const deleteInternshipMutation = useMutation(
    async (internshipId) => {
      await axios.delete(`/recruiters/internships/${internshipId}`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recruiterInternships')
        queryClient.invalidateQueries('recruiterStats')
      }
    }
  )

  const onSubmit = async (data) => {
    if (editingInternship) {
      updateInternshipMutation.mutate({ id: editingInternship._id, data })
    } else {
      createInternshipMutation.mutate(data)
    }
  }

  const handleEdit = (internship) => {
    setEditingInternship(internship)
    reset({
      title: internship.title,
      company: internship.company,
      description: internship.description,
      requirements: internship.requirements?.join('\n'),
      responsibilities: internship.responsibilities?.join('\n'),
      skills: internship.skills?.join(', '),
      location: internship.location,
      workType: internship.workType,
      duration: internship.duration,
      startDate: internship.startDate?.split('T')[0],
      applicationDeadline: internship.applicationDeadline?.split('T')[0],
      openings: internship.openings,
      industry: internship.industry,
      isPaid: internship.isPaid,
      stipend: internship.stipend
    })
  }

  const handleDelete = (internshipId) => {
    if (window.confirm('Are you sure you want to delete this internship? This action cannot be undone.')) {
      deleteInternshipMutation.mutate(internshipId)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Internships</h1>
          <p className="mt-2 text-gray-600">Manage your internship postings and track applications.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Post New Internship
        </button>
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || editingInternship) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {editingInternship ? 'Edit Internship' : 'Post New Internship'}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Internship Title *
                    </label>
                    <input
                      {...register('title', { required: 'Title is required' })}
                      className={`input ${errors.title ? 'input-error' : ''}`}
                      placeholder="e.g., Frontend Developer Intern"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company *
                    </label>
                    <input
                      {...register('company', { required: 'Company is required' })}
                      className={`input ${errors.company ? 'input-error' : ''}`}
                      placeholder="Your company name"
                    />
                    {errors.company && (
                      <p className="mt-1 text-sm text-error-600">{errors.company.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={4}
                    className={`input ${errors.description ? 'input-error' : ''}`}
                    placeholder="Describe the internship role and what the intern will be doing..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requirements
                    </label>
                    <textarea
                      {...register('requirements')}
                      rows={3}
                      className="input"
                      placeholder="List requirements (one per line)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsibilities
                    </label>
                    <textarea
                      {...register('responsibilities')}
                      rows={3}
                      className="input"
                      placeholder="List responsibilities (one per line)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills (comma-separated)
                    </label>
                    <input
                      {...register('skills')}
                      className="input"
                      placeholder="e.g., JavaScript, React, Node.js"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      {...register('location', { required: 'Location is required' })}
                      className={`input ${errors.location ? 'input-error' : ''}`}
                      placeholder="e.g., San Francisco, CA or Remote"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-error-600">{errors.location.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Type *
                    </label>
                    <select
                      {...register('workType', { required: 'Work type is required' })}
                      className={`input ${errors.workType ? 'input-error' : ''}`}
                    >
                      <option value="">Select work type</option>
                      <option value="onsite">On-site</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                    {errors.workType && (
                      <p className="mt-1 text-sm text-error-600">{errors.workType.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration *
                    </label>
                    <input
                      {...register('duration', { required: 'Duration is required' })}
                      className={`input ${errors.duration ? 'input-error' : ''}`}
                      placeholder="e.g., 3 months, 6 months"
                    />
                    {errors.duration && (
                      <p className="mt-1 text-sm text-error-600">{errors.duration.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Openings *
                    </label>
                    <input
                      {...register('openings', { 
                        required: 'Openings is required',
                        min: 1,
                        valueAsNumber: true
                      })}
                      type="number"
                      className={`input ${errors.openings ? 'input-error' : ''}`}
                      placeholder="Number of positions"
                    />
                    {errors.openings && (
                      <p className="mt-1 text-sm text-error-600">{errors.openings.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      {...register('startDate', { required: 'Start date is required' })}
                      type="date"
                      className={`input ${errors.startDate ? 'input-error' : ''}`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-error-600">{errors.startDate.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Deadline *
                    </label>
                    <input
                      {...register('applicationDeadline', { required: 'Deadline is required' })}
                      type="date"
                      className={`input ${errors.applicationDeadline ? 'input-error' : ''}`}
                    />
                    {errors.applicationDeadline && (
                      <p className="mt-1 text-sm text-error-600">{errors.applicationDeadline.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <input
                      {...register('industry', { required: 'Industry is required' })}
                      className={`input ${errors.industry ? 'input-error' : ''}`}
                      placeholder="e.g., Technology, Healthcare"
                    />
                    {errors.industry && (
                      <p className="mt-1 text-sm text-error-600">{errors.industry.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center">
                      <input
                        {...register('isPaid')}
                        type="checkbox"
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Paid Internship</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stipend (if paid)
                    </label>
                    <input
                      {...register('stipend')}
                      className="input"
                      placeholder="e.g., $2000/month, $15/hour"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false)
                      setEditingInternship(null)
                      reset()
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createInternshipMutation.isLoading || updateInternshipMutation.isLoading}
                    className="btn-primary"
                  >
                    {createInternshipMutation.isLoading || updateInternshipMutation.isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      editingInternship ? 'Update Internship' : 'Post Internship'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search internships by title or company..."
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

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter('')}
                className={`btn-sm ${
                  statusFilter === '' ? 'btn-primary' : 'btn-outline'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`btn-sm ${
                  statusFilter === 'active' ? 'btn-primary' : 'btn-outline'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`btn-sm ${
                  statusFilter === 'pending' ? 'btn-warning' : 'btn-outline'
                }`}
              >
                Pending
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
                    <div className="flex-1">
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
                              Deadline: {formatDate(internship.applicationDeadline)}
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
                                {internship.skills.slice(0, 3).map((skill, index) => (
                                  <span key={index} className="badge badge-primary text-xs">
                                    {skill}
                                  </span>
                                ))}
                                {internship.skills.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{internship.skills.length - 3} more
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
                            {internship.isApproved ? 'Approved' : 'Pending Approval'}
                          </span>
                          
                          <div className="mt-3 space-y-2">
                            <Link
                              to={`/student/internships/${internship._id}`}
                              className="btn-outline btn-sm block w-full"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(internship)}
                                className="btn-outline btn-sm flex-1"
                              >
                                <PencilIcon className="h-4 w-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(internship._id)}
                                disabled={deleteInternshipMutation.isLoading}
                                className="btn-error btn-sm flex-1"
                              >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Posted Date */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Posted on {formatDate(internship.postedAt)}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No internships posted yet</h3>
          <p className="text-gray-600 mb-4">
            Start by posting your first internship to attract talented candidates.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary"
          >
            Post Your First Internship
          </button>
        </div>
      )}
    </div>
  )
}

export default RecruiterInternshipsPage
