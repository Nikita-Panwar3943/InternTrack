import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { 
  MapPinIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import ResumeUpload from '../../components/ResumeUpload'
import axios from 'axios'

const InternshipDetailsPage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isApplying, setIsApplying] = useState(false)
  const [resume, setResume] = useState(null)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: internship, isLoading } = useQuery(
    ['internship', id],
    async () => {
      const response = await axios.get(`/internships/${id}`)
      return response.data.internship
    },
    { enabled: !!id }
  )

  const { data: hasApplied } = useQuery(
    ['hasApplied', id],
    async () => {
      const response = await axios.get(`/students/applications`)
      return response.data.applications.some(app => app.internship._id === id)
    },
    { enabled: !!id && !!user }
  )

  const applyMutation = useMutation(
    async (applicationData) => {
      const response = await axios.post(`/applications/internships/${id}/apply`, applicationData)
      return response.data.application
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hasApplied')
        queryClient.invalidateQueries('studentApplications')
        setIsApplying(false)
        reset()
      }
    }
  )

  const onSubmit = async (data) => {
    const applicationData = {
      ...data,
      resume
    }
    applyMutation.mutate(applicationData)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Expired'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `${diffDays} days left`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!internship) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Internship Not Found</h2>
        <p className="text-gray-600 mb-4">The internship you're looking for doesn't exist.</p>
        <Link to="/student/internships" className="btn-primary">
          Browse Internships
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/internships"
          className="flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Internships
        </Link>
        
        {!hasApplied && user?.role === 'student' && (
          <button
            onClick={() => setIsApplying(true)}
            className="btn-primary"
            disabled={new Date() > new Date(internship.applicationDeadline)}
          >
            {new Date() > new Date(internship.applicationDeadline) ? 'Application Closed' : 'Apply Now'}
          </button>
        )}
        
        {hasApplied && (
          <div className="flex items-center text-green-600">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Applied
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Internship Header */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-start space-x-4">
                {internship.companyLogo ? (
                  <img
                    src={internship.companyLogo}
                    alt={internship.company}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {internship.title}
                  </h1>
                  <p className="text-xl text-primary-600 font-medium mb-4">
                    {internship.company}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {internship.location}
                    </div>
                    <div className="flex items-center">
                      <BriefcaseIcon className="h-4 w-4 mr-1" />
                      {internship.workType}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {internship.duration}
                    </div>
                    {internship.isPaid && (
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                        {internship.stipend || 'Paid'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            </div>
            <div className="card-body">
              <p className="text-gray-700 whitespace-pre-wrap">
                {internship.description}
              </p>
            </div>
          </div>

          {/* Requirements */}
          {internship.requirements?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
              </div>
              <div className="card-body">
                <ul className="space-y-2">
                  {internship.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Responsibilities */}
          {internship.responsibilities?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Responsibilities</h3>
              </div>
              <div className="card-body">
                <ul className="space-y-2">
                  {internship.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Skills */}
          {internship.skills?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Required Skills</h3>
              </div>
              <div className="card-body">
                <div className="flex flex-wrap gap-2">
                  {internship.skills.map((skill, index) => (
                    <span key={index} className="badge badge-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Application Information</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <p className="text-sm text-gray-600">Application Deadline</p>
                <p className="font-medium text-gray-900">
                  {formatDate(internship.applicationDeadline)}
                </p>
                <p className={`text-sm ${
                  new Date() > new Date(internship.applicationDeadline) 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {getDaysUntilDeadline(internship.applicationDeadline)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(internship.startDate)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Openings</p>
                <p className="font-medium text-gray-900">{internship.openings} positions</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Industry</p>
                <p className="font-medium text-gray-900">{internship.industry}</p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
            </div>
            <div className="card-body">
              <div className="text-center mb-4">
                {internship.companyLogo ? (
                  <img
                    src={internship.companyLogo}
                    alt={internship.company}
                    className="w-20 h-20 rounded-lg object-cover mx-auto"
                  />
                ) : (
                  <div className="w-20 h-20 bg-primary-100 rounded-lg flex items-center justify-center mx-auto">
                    <BuildingOfficeIcon className="h-10 w-10 text-primary-600" />
                  </div>
                )}
              </div>
              
              <h4 className="font-medium text-gray-900 text-center mb-2">
                {internship.company}
              </h4>
              
              {internship.companyWebsite && (
                <div className="text-center">
                  <a
                    href={internship.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
            </div>
            <div className="card-body space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Views</span>
                <span className="font-medium text-gray-900">{internship.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Applications</span>
                <span className="font-medium text-gray-900">{internship.applicationsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Posted</span>
                <span className="font-medium text-gray-900">
                  {formatDate(internship.postedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {isApplying && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Apply for {internship.title}
              </h3>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume Upload <span className="text-red-500">*</span>
                  </label>
                  <ResumeUpload onUpload={setResume} currentResume={resume} />
                  {!resume && (
                    <p className="mt-1 text-xs text-red-500">Resume is required to apply</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter (Optional)
                  </label>
                  <textarea
                    {...register('coverLetter')}
                    rows={6}
                    className="input"
                    placeholder="Tell us why you're interested in this internship and why you'd be a great fit..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsApplying(false)
                      reset()
                      setResume(null)
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applyMutation.isLoading || !resume}
                    className="btn-primary"
                  >
                    {applyMutation.isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Submit Application'
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

export default InternshipDetailsPage
