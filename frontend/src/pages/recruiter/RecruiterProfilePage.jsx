import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { 
  UserCircleIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CameraIcon,
  CheckIcon,
  GlobeAltIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import axios from 'axios'

const RecruiterProfilePage = () => {
  const { user, updateProfile } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: profile, isLoading } = useQuery(
    'recruiterProfile',
    async () => {
      const response = await axios.get('/api/recruiters/profile')
      return response.data.profile
    },
    { enabled: !!user }
  )

  const updateProfileMutation = useMutation(
    async (profileData) => {
      const response = await axios.put('/api/recruiters/profile', profileData)
      return response.data.profile
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData('recruiterProfile', data)
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
        company: profile.company,
        position: profile.position,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        companyWebsite: profile.companyWebsite,
        companySize: profile.companySize,
        industry: profile.industry
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
          <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
          <p className="mt-2 text-gray-600">Manage your company information and recruiting details.</p>
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
              {profile?.company && (
                <p className="text-primary-600 font-medium mt-1">{profile.company}</p>
              )}
              
              <div className="mt-6 flex justify-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {profile?.stats?.internshipsPosted || 0}
                  </div>
                  <p className="text-sm text-gray-600">Internships</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {profile?.stats?.applicationsReceived || 0}
                  </div>
                  <p className="text-sm text-gray-600">Applications</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {profile?.stats?.candidatesHired || 0}
                  </div>
                  <p className="text-sm text-gray-600">Hired</p>
                </div>
              </div>

              {/* Verification Status */}
              <div className="mt-6">
                <span className={`badge ${
                  profile?.isVerified ? 'badge-success' : 'badge-warning'
                }`}>
                  {profile?.isVerified ? 'Verified' : 'Not Verified'}
                </span>
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
                      placeholder="Tell us about your company and recruiting goals..."
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

          {/* Company Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
            </div>
            <div className="card-body">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        {...register('company', { required: 'Company name is required' })}
                        className={`input ${errors.company ? 'input-error' : ''}`}
                        placeholder="Enter company name"
                      />
                      {errors.company && (
                        <p className="mt-1 text-sm text-error-600">{errors.company.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position
                      </label>
                      <input
                        {...register('position', { required: 'Position is required' })}
                        className={`input ${errors.position ? 'input-error' : ''}`}
                        placeholder="Your position"
                      />
                      {errors.position && (
                        <p className="mt-1 text-sm text-error-600">{errors.position.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry
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
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Size
                      </label>
                      <select
                        {...register('companySize')}
                        className="input"
                      >
                        <option value="">Select company size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Website
                    </label>
                    <input
                      {...register('companyWebsite')}
                      type="url"
                      className="input"
                      placeholder="https://www.company.com"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Company</p>
                      <p className="font-medium text-gray-900">{profile?.company || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Position</p>
                      <p className="font-medium text-gray-900">{profile?.position || 'Not set'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Industry</p>
                      <p className="font-medium text-gray-900">{profile?.industry || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Company Size</p>
                      <p className="font-medium text-gray-900">{profile?.companySize || 'Not set'}</p>
                    </div>
                  </div>

                  {profile?.companyWebsite && (
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <a
                        href={profile.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <GlobeAltIcon className="h-4 w-4 mr-1" />
                        {profile.companyWebsite}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Performance Overview */}
          {profile?.stats && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">
                      {profile.stats.internshipsPosted}
                    </div>
                    <p className="text-sm text-gray-600">Internships Posted</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {profile.stats.applicationsReceived}
                    </div>
                    <p className="text-sm text-gray-600">Applications Received</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {profile.stats.candidatesHired}
                    </div>
                    <p className="text-sm text-gray-600">Candidates Hired</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {profile.stats.internshipsPosted > 0 
                        ? Math.round((profile.stats.candidatesHired / profile.stats.internshipsPosted) * 100)
                        : 0}%
                    </div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecruiterProfilePage
