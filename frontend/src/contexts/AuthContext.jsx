import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

const getInitialFormData = () => {
  const storedData = sessionStorage.getItem('loginFormData');
  try {
    return storedData ? JSON.parse(storedData) : { email: '', password: '' };
  } catch (e) {
    return { email: '', password: '' };
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true) // Loading inicial de la app
  const [isLoggingIn, setIsLoggingIn] = useState(false) // Loading para el proceso de login
  const [loginError, setLoginError] = useState(localStorage.getItem('loginError'))
  const [loginFormData, setLoginFormDataState] = useState(getInitialFormData());

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/api/auth/me')
          setUser(response.data)
        } catch (error) {
          console.error('Error al verificar token:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [token])

  const clearLoginError = () => {
    setLoginError(null)
    localStorage.removeItem('loginError')
  }

  const setLoginFormData = (data) => {
    setLoginFormDataState(data);
    sessionStorage.setItem('loginFormData', JSON.stringify(data));
  };

  const login = async (email, password) => {
    setIsLoggingIn(true)
    clearLoginError()
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { access_token } = response.data
      
      localStorage.setItem('token', access_token)
      setToken(access_token)
      
      // Obtener información del usuario
      const userResponse = await api.get('/api/auth/me')
      setUser(userResponse.data)
      setIsLoggingIn(false)
      sessionStorage.removeItem('loginFormData');
      // No retornamos nada, el estado del contexto lo dirá todo
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Error al iniciar sesión'
      setLoginError(errorMessage)
      localStorage.setItem('loginError', errorMessage)
      setIsLoggingIn(false)
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData)
      return { success: true, user: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Error al registrarse' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    setUser,
    token,
    isAuthenticated: !!token,
    loading,
    isLoggingIn,
    loginError,
    clearLoginError,
    loginFormData,
    setLoginFormData,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
