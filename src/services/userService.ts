import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

// Create axios instance with auth
const axiosInstance = axios.create({
  baseURL: API_URL
})

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('firebaseToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Fetch emails for multiple user IDs
export async function fetchBatchEmails(userIds: string[]): Promise<Record<string, string>> {
  if (userIds.length === 0) {
    return {}
  }

  try {
    const { data } = await axiosInstance.post('/admin/users/batch-emails', {
      userIds
    })
    return data.emails || {}
  } catch (error) {
    console.error('Failed to fetch batch emails:', error)
    return {}
  }
}
