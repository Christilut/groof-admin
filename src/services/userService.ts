import { axiosInstance } from '../config/axios'

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
