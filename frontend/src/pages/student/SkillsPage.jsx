import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { 
  AcademicCapIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import axios from 'axios'

const SkillsPage = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: profile, isLoading } = useQuery(
    'studentProfile',
    async () => {
      const response = await axios.get('/api/students/profile')
      return response.data.profile
    },
    { enabled: !!user }
  )

  const { data: assessments } = useQuery(
    'skillAssessments',
    async () => {
      const response = await axios.get('/api/students/assessments')
      return response.data.assessments
    },
    { enabled: !!user }
  )

  const addSkillMutation = useMutation(
    async (skillData) => {
      const response = await axios.post('/api/students/skills', skillData)
      return response.data.skill
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('studentProfile')
        setIsAddingSkill(false)
        reset()
      }
    }
  )

  const removeSkillMutation = useMutation(
    async (skillId) => {
      await axios.delete(`/api/students/skills/${skillId}`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('studentProfile')
      }
    }
  )

  const onSubmit = async (data) => {
    addSkillMutation.mutate(data)
  }

  const getProficiencyColor = (proficiency) => {
    switch (proficiency) {
      case 'expert': return 'bg-purple-100 text-purple-800'
      case 'advanced': return 'bg-blue-100 text-blue-800'
      case 'intermediate': return 'bg-green-100 text-green-800'
      case 'beginner': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
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
          <h1 className="text-3xl font-bold text-gray-900">Skills & Assessments</h1>
          <p className="mt-2 text-gray-600">Manage your skills and track your progress.</p>
        </div>
        <button
          onClick={() => setIsAddingSkill(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Skill
        </button>
      </div>

      {/* Add Skill Form */}
      {isAddingSkill && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Add New Skill</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill Name
                  </label>
                  <input
                    {...register('name', { required: 'Skill name is required' })}
                    className={`input ${errors.name ? 'input-error' : ''}`}
                    placeholder="e.g., JavaScript, Python, React"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proficiency Level
                  </label>
                  <select
                    {...register('proficiency', { required: 'Proficiency is required' })}
                    className={`input ${errors.proficiency ? 'input-error' : ''}`}
                  >
                    <option value="">Select proficiency</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  {errors.proficiency && (
                    <p className="mt-1 text-sm text-error-600">{errors.proficiency.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingSkill(false)
                    reset()
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSkillMutation.isLoading}
                  className="btn-primary"
                >
                  {addSkillMutation.isLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    'Add Skill'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Skills Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Skills List */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Your Skills</h3>
            </div>
            <div className="card-body">
              {profile?.skills?.length > 0 ? (
                <div className="space-y-4">
                  {profile.skills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{skill.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`badge ${getProficiencyColor(skill.proficiency)}`}>
                              {skill.proficiency}
                            </span>
                            <button
                              onClick={() => removeSkillMutation.mutate(skill._id)}
                              className="text-error-600 hover:text-error-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-600 mr-2">Score:</span>
                              <span className={`font-bold ${getScoreColor(skill.score)}`}>
                                {skill.score}%
                              </span>
                            </div>
                            {skill.lastAssessed && (
                              <div className="flex items-center text-sm text-gray-500">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                Assessed {new Date(skill.lastAssessed).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${skill.score}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No skills added yet</p>
                  <button
                    onClick={() => setIsAddingSkill(true)}
                    className="btn-primary"
                  >
                    Add Your First Skill
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skills Statistics */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Skills Statistics</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {profile?.skills?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Total Skills</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {profile?.skills?.filter(s => s.lastAssessed).length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Skills Assessed</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {profile?.skills?.length > 0 
                      ? Math.round(profile.skills.reduce((acc, skill) => acc + skill.score, 0) / profile.skills.length)
                      : 0}%
                  </div>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Proficiency Distribution */}
          {profile?.skills?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Proficiency Distribution</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {['beginner', 'intermediate', 'advanced', 'expert'].map(level => {
                    const count = profile.skills.filter(s => s.proficiency === level).length
                    const percentage = profile.skills.length > 0 ? (count / profile.skills.length) * 100 : 0
                    
                    return (
                      <div key={level}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{level}</span>
                          <span>{count} skills</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              level === 'expert' ? 'bg-purple-600' :
                              level === 'advanced' ? 'bg-blue-600' :
                              level === 'intermediate' ? 'bg-green-600' :
                              'bg-yellow-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Assessments */}
      {assessments?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Assessments</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {assessments.slice(0, 5).map((assessment) => (
                <div key={assessment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{assessment.skill}</p>
                    <p className="text-sm text-gray-600">
                      {assessment.correctAnswers}/{assessment.totalQuestions} questions correct
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(assessment.score)}`}>
                      {assessment.score}%
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(assessment.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SkillsPage
