import axios, { AxiosInstance } from 'axios'

const API_URL = import.meta.env.VITE_API_URL

// Create axios instance with base configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('firebaseToken')
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 unauthorized errors globally
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('firebaseToken')
      localStorage.removeItem('adminUser')
      // Redirect to login will be handled by auth provider
    }

    return Promise.reject(error)
  }
)

export { axiosInstance, API_URL }
