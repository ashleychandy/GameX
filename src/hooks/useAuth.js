import { useState, useCallback } from 'react'

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  const login = useCallback(async (credentials) => {
    try {
      // API call logic here
      setIsAuthenticated(true)
      setUser({ /* user data */ })
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setUser(null)
  }, [])

  return {
    isAuthenticated,
    user,
    login,
    logout
  }
} 