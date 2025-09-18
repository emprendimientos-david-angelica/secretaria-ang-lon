import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Lock, ArrowLeft, Sparkles, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { api } from '../services/api'

function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    new_password: '',
    confirm_password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    // Obtener email del estado de navegación
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }))
    }
  }, [location.state])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validaciones
    if (formData.new_password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.new_password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    if (formData.code.length !== 6) {
      setError('El código debe tener 6 dígitos')
      setLoading(false)
      return
    }

    try {
      await api.post('/api/auth/reset-password', {
        email: formData.email,
        code: formData.code,
        new_password: formData.new_password
      })
      setSuccess(true)
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al restablecer la contraseña')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-glow mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Contraseña actualizada!
            </h2>
            <p className="text-gray-600">
              Tu contraseña ha sido restablecida exitosamente
            </p>
          </div>

          {/* Success Message */}
          <div className="card">
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                <p className="font-medium">Contraseña restablecida</p>
                <p className="text-sm mt-1">
                  Ya puedes iniciar sesión con tu nueva contraseña
                </p>
              </div>
              <br />
              <Link
                to="/login"
                className="btn-primary w-full py-3 text-lg"
              >
                Ir al login
              </Link>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-rose-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-primary-500 to-rose-500 rounded-3xl flex items-center justify-center shadow-glow mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Restablecer contraseña
          </h2>
          <p className="text-gray-600">
            Ingresa el código y tu nueva contraseña
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">
                Email donde se envió el código
              </p>
            </div>

            <div>
              <label htmlFor="code" className="form-label">
                Código de verificación
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                maxLength="6"
                className="input-field text-center text-2xl tracking-widest"
                placeholder="000000"
                value={formData.code}
                onChange={handleChange}
              />
              <p className="text-sm text-gray-500 mt-1">
                Código de 6 dígitos enviado a tu email
              </p>
            </div>

            <div>
              <label htmlFor="new_password" className="form-label">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="new_password"
                  name="new_password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.new_password}
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

            <div>
              <label htmlFor="confirm_password" className="form-label">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="input-field pl-10 pr-10"
                  placeholder="Repite tu nueva contraseña"
                  value={formData.confirm_password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/forgot-password" 
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver a solicitar código</span>
            </Link>
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

export default ResetPassword
