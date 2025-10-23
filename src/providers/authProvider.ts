import { AuthProvider } from '@refinedev/core'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { auth } from '../config/firebase'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export const authProvider: AuthProvider = {
  login: async () => {
    try {
      // Sign in with Google using popup
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
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

      // Handle popup closed by user
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return {
          success: false,
          error: {
            name: 'LoginError',
            message: 'Sign-in cancelled'
          }
        }
      }

      return {
        success: false,
        error: {
          name: 'LoginError',
          message: error.message || 'Failed to sign in with Google'
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
    console.log('[AUTH CHECK] Starting auth check...')
    const token = localStorage.getItem('firebaseToken')
    console.log('[AUTH CHECK] Token exists:', !!token)

    if (!token) {
      console.log('[AUTH CHECK] No token found, redirecting to login')
      return {
        authenticated: false,
        redirectTo: '/login'
      }
    }

    // Check if Firebase user is still authenticated
    const user = auth.currentUser
    console.log('[AUTH CHECK] Current user exists:', !!user)

    if (!user) {
      console.log('[AUTH CHECK] No current user, waiting for auth state...')
      // Wait for auth state to initialize
      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          console.warn('[AUTH CHECK] Auth check timed out, redirecting to login')
          localStorage.removeItem('firebaseToken')
          localStorage.removeItem('adminUser')
          resolve({
            authenticated: false,
            redirectTo: '/login'
          })
        }, 3000) // 3 second timeout

        console.log('[AUTH CHECK] Setting up onAuthStateChanged listener...')
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          console.log('[AUTH CHECK] onAuthStateChanged fired, user:', !!firebaseUser)
          clearTimeout(timeoutId)
          unsubscribe()

          if (!firebaseUser) {
            console.log('[AUTH CHECK] No Firebase user, redirecting to login')
            localStorage.removeItem('firebaseToken')
            localStorage.removeItem('adminUser')
            resolve({
              authenticated: false,
              redirectTo: '/login'
            })
            return
          }

          // User is authenticated
          try {
            console.log('[AUTH CHECK] Getting fresh token...')
            const freshToken = await firebaseUser.getIdToken(true)
            localStorage.setItem('firebaseToken', freshToken)
            console.log('[AUTH CHECK] Token refreshed, user authenticated')
            resolve({
              authenticated: true
            })
          } catch (error) {
            console.error('[AUTH CHECK] Error refreshing token:', error)
            localStorage.removeItem('firebaseToken')
            localStorage.removeItem('adminUser')
            resolve({
              authenticated: false,
              redirectTo: '/login'
            })
          }
        })
      })
    }

    // User is already authenticated, just verify token is still valid
    try {
      console.log('[AUTH CHECK] Current user exists, refreshing token...')
      const freshToken = await user.getIdToken(true)
      localStorage.setItem('firebaseToken', freshToken)
      console.log('[AUTH CHECK] Token refreshed successfully, user authenticated')
      return {
        authenticated: true
      }
    } catch (error) {
      console.error('[AUTH CHECK] Error refreshing token:', error)
      localStorage.removeItem('firebaseToken')
      localStorage.removeItem('adminUser')
      return {
        authenticated: false,
        redirectTo: '/login'
      }
    }
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
