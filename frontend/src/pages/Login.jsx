import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Sparkles, Eye, EyeOff, X, AlertCircle } from 'lucide-react'

function Login() {
  const [showPassword, setShowPassword] = useState(false)
  
  const { 
    login, 
    isLoggingIn, 
    loginError, 
    clearLoginError,
    loginFormData,
    setLoginFormData
  } = useAuth()
  
  const navigate = useNavigate()

  // Efecto para manejar la visualización del error
  // Ya no se necesita un estado local para 'showError', el error viene del contexto

  // Función para cerrar el error manualmente
  // Esto también se manejará en el contexto para limpiar el error
  
  const handleChange = (e) => {
    if (loginError) {
      clearLoginError()
    }
    setLoginFormData({
      ...loginFormData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    login(loginFormData.email, loginFormData.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-primary-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-glow mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido de vuelta!
          </h2>
          <p className="text-gray-600">
            Tu secretaria personal te está esperando
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {loginError && (
              <div className="transition-all duration-300 ease-in-out transform opacity-100 translate-y-0 scale-100">
                <div className="bg-rose-50 border-l-4 border-rose-400 text-rose-700 px-4 py-3 rounded-xl shadow-lg relative">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{loginError}</p>
                    </div>
                    {/* El botón de cierre se puede re-implementar si es necesario, 
                        pero por ahora se limpiará al reintentar el login */}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="tu@email.com"
                  value={loginFormData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="Tu contraseña"
                  value={loginFormData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <div>
              <Link 
                to="/forgot-password" 
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <p className="text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link 
                to="/register" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>La Secretaria de AngLon - Tu asistente digital de confianza</p>
        </div>
      </div>
    </div>
  )
}

export default Login
