import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { 
  UserCircleIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CameraIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import axios from 'axios'

const ProfilePage = () => {
  const { user, updateProfile } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: profile, isLoading } = useQuery(
    'studentProfile',
    async () => {
      const response = await axios.get('/api/students/profile')
      return response.data.profile
    },
    { enabled: !!user }
  )

  const { data: applications } = useQuery(
    'studentApplications',
    async () => {
      const response = await axios.get('/api/students/applications')
      return response.data.applications
    },
    { enabled: !!user }
  )

  const updateProfileMutation = useMutation(
    async (profileData) => {
      const response = await axios.put('/api/students/profile', profileData)
      return response.data.profile
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData('studentProfile', data)
        setIsEditing(false)
        updateProfile(data)
      }
    }
  )

  const onSubmit = async (data) => {
    updateProfileMutation.mutate(data)
  }

  const handleEdit = () => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio
      })
    }
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    reset()
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">Manage your personal information and professional details.</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="btn-primary"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-body text-center">
              <div className="relative inline-block">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto"
                  />
                ) : (
                  <UserCircleIcon className="h-24 w-24 text-gray-400 mx-auto" />
                )}
                <button className="absolute bottom-0 right-0 p-1 bg-primary-600 text-white rounded-full hover:bg-primary-700">
                  <CameraIcon className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              {profile?.location && (
                <p className="text-sm text-gray-500 mt-1">{profile.location}</p>
              )}
              
              <div className="mt-6 flex justify-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {profile?.skills?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Skills</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {profile?.education?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Education</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {profile?.experience?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="card-body">
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        {...register('firstName', { required: 'First name is required' })}
                        className={`input ${errors.firstName ? 'input-error' : ''}`}
                        placeholder="Enter your first name"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-error-600">{errors.firstName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        {...register('lastName', { required: 'Last name is required' })}
                        className={`input ${errors.lastName ? 'input-error' : ''}`}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-error-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      {...register('phone')}
                      className="input"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      {...register('location')}
                      className="input"
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      {...register('bio')}
                      rows={4}
                      className="input"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isLoading}
                      className="btn-primary"
                    >
                      {updateProfileMutation.isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">First Name</p>
                      <p className="font-medium text-gray-900">{profile?.firstName || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Name</p>
                      <p className="font-medium text-gray-900">{profile?.lastName || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{profile?.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">{profile?.location || 'Not set'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Bio</p>
                    <p className="font-medium text-gray-900">{profile?.bio || 'No bio added'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                <button className="btn-primary btn-sm">
                  Add Skill
                </button>
              </div>
            </div>
            <div className="card-body">
              {profile?.skills?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{skill.name}</p>
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
              ) : (
                <div className="text-center py-8">
                  <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No skills added yet</p>
                  <button className="btn-primary mt-4">Add Your First Skill</button>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                <button className="btn-primary btn-sm">
                  Add Education
                </button>
              </div>
            </div>
            <div className="card-body">
              {profile?.education?.length > 0 ? (
                <div className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-primary-500 pl-4">
                      <p className="font-medium text-gray-900">{edu.degree} in {edu.field}</p>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(edu.startDate).getFullYear()} - {edu.current ? 'Present' : new Date(edu.endDate).getFullYear()}
                      </p>
                      {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No education added yet</p>
                  <button className="btn-primary mt-4">Add Your Education</button>
                </div>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
                <button className="btn-primary btn-sm">
                  Add Experience
                </button>
              </div>
            </div>
            <div className="card-body">
              {profile?.experience?.length > 0 ? (
                <div className="space-y-4">
                  {profile.experience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-primary-500 pl-4">
                      <p className="font-medium text-gray-900">{exp.position}</p>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : new Date(exp.endDate).getFullYear()}
                      </p>
                      {exp.description && <p className="text-sm text-gray-700 mt-2">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No experience added yet</p>
                  <button className="btn-primary mt-4">Add Your Experience</button>
                </div>
              )}
            </div>
          </div>

          {/* Application Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Application Status</h3>
            </div>
            <div className="card-body">
              {applications && applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{application.internship?.title}</p>
                        <p className="text-sm text-gray-600">{application.internship?.company}</p>
                        <p className="text-xs text-gray-500">
                          Applied: {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`badge ${
                          application.status === 'shortlisted' ? 'badge-warning' :
                          application.status === 'interview' ? 'badge-primary' :
                          application.status === 'selected' ? 'badge-success' :
                          application.status === 'rejected' ? 'badge-error' :
                          'badge-secondary'
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        {application.status === 'shortlisted' && (
                          <p className="text-xs text-green-600 mt-1">🎉 Shortlisted!</p>
                        )}
                        {application.interviewSchedule?.date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Interview: {new Date(application.interviewSchedule.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No applications yet</p>
                  <Link to="/student/internships" className="btn-primary mt-4">
                    Browse Internships
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
