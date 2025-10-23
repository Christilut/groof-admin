import { AuthProvider } from '@refinedev/core'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { auth } from '../config/firebase'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Get Firebase ID token
      const idToken = await user.getIdToken()

      // Verify with backend that user has admin role
      const response = await axios.post(
        `${API_URL}/admin/auth/login`,
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        }
      )

      // Store token in localStorage
      localStorage.setItem('firebaseToken', idToken)
      localStorage.setItem('adminUser', JSON.stringify(response.data.user))

      return {
        success: true,
        redirectTo: '/'
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        return {
          success: false,
          error: {
            name: 'LoginError',
            message: 'You do not have admin access'
          }
        }
      }

      return {
        success: false,
        error: {
          name: 'LoginError',
          message: error.message || 'Invalid email or password'
        }
      }
    }
  },

  logout: async () => {
    await signOut(auth)
    localStorage.removeItem('firebaseToken')
    localStorage.removeItem('adminUser')

    return {
      success: true,
      redirectTo: '/login'
    }
  },

  check: async () => {
    const token = localStorage.getItem('firebaseToken')

    if (!token) {
      return {
        authenticated: false,
        redirectTo: '/login'
      }
    }

    // Check if Firebase user is still authenticated
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
        unsubscribe()

        if (!user) {
          resolve({
            authenticated: false,
            redirectTo: '/login'
          })
          return
        }

        // Refresh token if needed
        try {
          const freshToken = await user.getIdToken(true)
          localStorage.setItem('firebaseToken', freshToken)

          resolve({
            authenticated: true
          })
        } catch (error) {
          resolve({
            authenticated: false,
            redirectTo: '/login'
          })
        }
      })
    })
  },

  getPermissions: async () => {
    const adminUser = localStorage.getItem('adminUser')

    if (!adminUser) {
      return null
    }

    const user = JSON.parse(adminUser)
    return user.role || []
  },

  getIdentity: async () => {
    const adminUser = localStorage.getItem('adminUser')

    if (!adminUser) {
      return null
    }

    const user = JSON.parse(adminUser)

    return {
      id: user.id,
      name: user.displayName || user.email,
      avatar: user.photoUrl,
      email: user.email
    }
  },

  onError: async (error) => {
    console.error('Auth error:', error)
    return { error }
  }
}
