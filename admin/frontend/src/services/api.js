import axios from 'axios'

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Servicios de usuarios
export const usersService = {
  // Obtener todos los usuarios
  getAllUsers: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/users?skip=${skip}&limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  // Obtener usuario por ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  },

  // Crear nuevo usuario
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData)
      return response.data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  // Actualizar usuario
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData)
      return response.data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  // Eliminar usuario
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },

  // Cambiar contraseña de usuario
  changeUserPassword: async (userId, newPassword) => {
    try {
      const response = await api.post(`/users/${userId}/change-password`, {
        new_password: newPassword
      })
      return response.data
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }
}

// Servicios del sistema
export const systemService = {
  // Obtener estadísticas del sistema
  getSystemStats: async () => {
    try {
      const response = await api.get('/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching system stats:', error)
      throw error
    }
  },

  // Obtener logs del sistema
  getSystemLogs: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/logs?skip=${skip}&limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Error fetching system logs:', error)
      throw error
    }
  }
}

// Servicio de autenticación
export const authService = {
  // Login de administrador
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password })
      const { access_token } = response.data
      localStorage.setItem('admin_token', access_token)
      return response.data
    } catch (error) {
      console.error('Error logging in:', error)
      throw error
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('admin_token')
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('admin_token')
  }
}

export default api
