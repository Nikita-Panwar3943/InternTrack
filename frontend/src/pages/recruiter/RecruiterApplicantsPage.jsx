import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  EyeIcon,
  CalendarIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import axios from 'axios'

const RecruiterApplicantsPage = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [internshipFilter, setInternshipFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: applications, isLoading, error } = useQuery(
    ['recruiterApplications', currentPage, statusFilter, internshipFilter],
    async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...(statusFilter && { status: statusFilter }),
        ...(internshipFilter && { internship: internshipFilter })
      })
      
      const response = await axios.get(`/recruiters/applications?${params}`)
      return response.data
    },
    { keepPreviousData: true }
  )

  const { data: internships } = useQuery(
    'recruiterInternshipsList',
    async () => {
      const response = await axios.get('/recruiters/internships')
      return response.data.internships
    }
  )

  const updateApplicationStatusMutation = useMutation(
    async ({ applicationId, status, notes }) => {
      const response = await axios.put(`/recruiters/applications/${applicationId}/status`, {
        status,
        notes
      })
      return response.data.application
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recruiterApplications')
        setSelectedApplicant(null)
      }
    }
  )

  const scheduleInterviewMutation = useMutation(
    async ({ applicationId, interviewData }) => {
      const response = await axios.put(`/recruiters/applications/${applicationId}/schedule-interview`, interviewData)
      return response.data.application
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recruiterApplications')
        setShowInterviewModal(false)
        reset()
      }
    }
  )

  const handleStatusUpdate = (applicationId, status) => {
    const notes = prompt(`Add notes for ${status} status:`)
    if (notes !== null) {
      updateApplicationStatusMutation.mutate({ applicationId, status, notes })
    }
  }

  const handleScheduleInterview = (application) => {
    setSelectedApplicant(application)
    setShowInterviewModal(true)
  }

  const onInterviewSubmit = (data) => {
    if (selectedApplicant) {
      scheduleInterviewMutation.mutate({
        applicationId: selectedApplicant._id,
        interviewData: data
      })
    }
  }

  const clearFilters = () => {
    setStatusFilter('')
    setInternshipFilter('')
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'selected': return 'badge-success'
      case 'shortlisted': return 'badge-warning'
      case 'interview': return 'badge-primary'
      case 'rejected': return 'badge-error'
      default: return 'badge-secondary'
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Applicants Management</h1>
        <p className="mt-2 text-gray-600">Review and manage applications for your internships.</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="input"
              >
                <option value="">All Status</option>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internship Filter
              </label>
              <select
                value={internshipFilter}
                onChange={(e) => {
                  setInternshipFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="input"
              >
                <option value="">All Internships</option>
                {internships?.map(internship => (
                  <option key={internship._id} value={internship._id}>
                    {internship.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(statusFilter || internshipFilter) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {applications?.applications?.length || 0} results
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : applications?.applications?.length > 0 ? (
        <>
          <div className="space-y-4">
            {applications.applications.map((application) => (
              <div key={application._id} className="card hover:shadow-md transition-shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {/* Applicant Avatar */}
                      <div className="flex-shrink-0">
                        {application.student?.profile?.avatar ? (
                          <img
                            src={application.student.profile.avatar}
                            alt={application.student.profile.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <UserGroupIcon className="h-6 w-6 text-primary-600" />
                          </div>
                        )}
                      </div>

                      {/* Applicant Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.student?.profile?.firstName} {application.student?.profile?.lastName}
                            </h3>
                            <p className="text-gray-600">{application.student?.email}</p>
                            
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <BriefcaseIcon className="h-4 w-4 mr-1" />
                                {application.internship?.title}
                              </div>
                              {application.student?.profile?.location && (
                                <div className="flex items-center">
                                  <span className="text-sm">Location:</span>
                                  <span className="ml-1">{application.student.profile.location}</span>
                                </div>
                              )}
                            </div>

                            {/* Skills */}
                            {application.student?.profile?.skills?.length > 0 && (
                              <div className="mt-3">
                                <div className="flex flex-wrap gap-1">
                                  {application.student.profile.skills.slice(0, 4).map((skill, index) => (
                                    <span key={index} className="badge badge-primary text-xs">
                                      {skill.name}
                                    </span>
                                  ))}
                                  {application.student.profile.skills.length > 4 && (
                                    <span className="text-xs text-gray-500">
                                      +{application.student.profile.skills.length - 4} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Cover Letter Preview */}
                            {application.coverLetter && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700 line-clamp-2">
                                  {application.coverLetter}
                                </p>
                              </div>
                            )}

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

                            {/* Timeline */}
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              Applied on {formatDate(application.appliedAt)}
                              {application.lastUpdated !== application.appliedAt && (
                                <span className="ml-4">
                                  Updated {formatDate(application.lastUpdated)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status and Actions */}
                          <div className="text-right">
                            <span className={`badge ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                            
                            <div className="mt-3 space-y-2">
                              <button
                                onClick={() => setSelectedApplicant(application)}
                                className="btn-outline btn-sm w-full"
                              >
                                <EyeIcon className="h-4 w-4 mr-1" />
                                View Details
                              </button>
                              
                              {/* Action Buttons based on status */}
                              {application.status === 'applied' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleStatusUpdate(application._id, 'shortlisted')}
                                    className="btn-warning btn-sm flex-1"
                                  >
                                    Shortlist
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                    className="btn-error btn-sm flex-1"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              
                              {application.status === 'shortlisted' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleScheduleInterview(application)}
                                    className="btn-primary btn-sm flex-1"
                                  >
                                    Schedule Interview
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                    className="btn-error btn-sm flex-1"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                              
                              {application.status === 'interview' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleStatusUpdate(application._id, 'selected')}
                                    className="btn-success btn-sm flex-1"
                                  >
                                    Select
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                    className="btn-error btn-sm flex-1"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
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
          {applications.pagination && applications.pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((applications.pagination.page - 1) * applications.pagination.limit) + 1} to{' '}
                {Math.min(applications.pagination.page * applications.pagination.limit, applications.pagination.total)} of{' '}
                {applications.pagination.total} applications
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={applications.pagination.page === 1}
                  className="btn-outline btn-sm disabled:opacity-50"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {applications.pagination.page} of {applications.pagination.pages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, applications.pagination.pages))}
                  disabled={applications.pagination.page === applications.pagination.pages}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or post more internships to attract candidates.
          </p>
          <button onClick={clearFilters} className="btn-primary">
            Clear Filters
          </button>
        </div>
      )}

      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Applicant Details
                </h3>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <p className="font-medium">
                        {selectedApplicant.student?.profile?.firstName} {selectedApplicant.student?.profile?.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <p className="font-medium">{selectedApplicant.student?.email}</p>
                    </div>
                    {selectedApplicant.student?.profile?.phone && (
                      <div>
                        <span className="text-sm text-gray-600">Phone:</span>
                        <p className="font-medium">{selectedApplicant.student.profile.phone}</p>
                      </div>
                    )}
                    {selectedApplicant.student?.profile?.location && (
                      <div>
                        <span className="text-sm text-gray-600">Location:</span>
                        <p className="font-medium">{selectedApplicant.student.profile.location}</p>
                      </div>
                    )}
                    {selectedApplicant.student?.profile?.bio && (
                      <div>
                        <span className="text-sm text-gray-600">Bio:</span>
                        <p className="font-medium">{selectedApplicant.student.profile.bio}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Application Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Internship:</span>
                      <p className="font-medium">{selectedApplicant.internship?.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`badge ${getStatusColor(selectedApplicant.status)}`}>
                        {selectedApplicant.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Applied:</span>
                      <p className="font-medium">{formatDate(selectedApplicant.appliedAt)}</p>
                    </div>
                    {selectedApplicant.coverLetter && (
                      <div>
                        <span className="text-sm text-gray-600">Cover Letter:</span>
                        <p className="font-medium whitespace-pre-wrap mt-1">
                          {selectedApplicant.coverLetter}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedApplicant.student?.profile?.skills?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Skills</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedApplicant.student.profile.skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{skill.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{skill.proficiency}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-600">
                            {skill.score}%
                          </div>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="btn-outline"
                >
                  Close
                </button>
                
                {selectedApplicant.status === 'applied' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedApplicant._id, 'shortlisted')
                      setSelectedApplicant(null)
                    }}
                    className="btn-warning"
                  >
                    Shortlist Applicant
                  </button>
                )}
                
                {selectedApplicant.status === 'shortlisted' && (
                  <button
                    onClick={() => {
                      handleScheduleInterview(selectedApplicant)
                      setSelectedApplicant(null)
                    }}
                    className="btn-primary"
                  >
                    Schedule Interview
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Schedule Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Schedule Interview
              </h3>
              
              <form onSubmit={handleSubmit(onInterviewSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interview Date *
                    </label>
                    <input
                      {...register('date', { required: 'Date is required' })}
                      type="date"
                      className={`input ${errors.date ? 'input-error' : ''}`}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-error-600">{errors.date.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      {...register('time', { required: 'Time is required' })}
                      type="time"
                      className={`input ${errors.time ? 'input-error' : ''}`}
                    />
                    {errors.time && (
                      <p className="mt-1 text-sm text-error-600">{errors.time.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Type *
                  </label>
                  <select
                    {...register('type', { required: 'Type is required' })}
                    className={`input ${errors.type ? 'input-error' : ''}`}
                  >
                    <option value="">Select type</option>
                    <option value="phone">Phone</option>
                    <option value="video">Video</option>
                    <option value="onsite">On-site</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-error-600">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location/Link
                  </label>
                  <input
                    {...register('location')}
                    className="input"
                    placeholder="Meeting link, address, or phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="input"
                    placeholder="Any additional information for the candidate"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInterviewModal(false)
                      reset()
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={scheduleInterviewMutation.isLoading}
                    className="btn-primary"
                  >
                    {scheduleInterviewMutation.isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Schedule Interview'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecruiterApplicantsPage
