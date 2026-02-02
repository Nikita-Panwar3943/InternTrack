import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Configure axios defaults
  useEffect(() => {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    
    // Add request interceptor to include auth token
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Add response interceptor to handle auth errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          setUser(null)
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.request.eject(interceptor)
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [])

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await axios.get('/auth/me')
          setUser(response.data.user)
        } catch (error) {
          localStorage.removeItem('token')
          console.error('Auth check failed:', error)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true)
      const response = await axios.post('/auth/login', { email, password })
      
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      setUser(user)
      
      toast.success('Login successful!')
      return { success: true, user }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (userData) => {
    try {
      setLoading(true)
      const response = await axios.post('/auth/register', userData)
      
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      setUser(user)
      
      toast.success('Registration successful!')
      return { success: true, user }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await axios.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      toast.success('Logged out successfully')
    }
  }, [])

  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true)
      const endpoint = user.role === 'student' ? '/students/profile' : '/recruiters/profile'
      const response = await axios.put(endpoint, profileData)
      
      setUser(prev => ({
        ...prev,
        profile: response.data.profile
      }))
      
      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [user?.role])

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
