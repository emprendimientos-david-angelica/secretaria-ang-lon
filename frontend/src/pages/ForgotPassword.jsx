import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Sparkles, CheckCircle, X, AlertCircle } from 'lucide-react'
import { api } from '../services/api'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await api.post('/api/auth/forgot-password', { email })
      setSuccess(true)
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al enviar el código')
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
              ¡Código enviado!
            </h2>
            <p className="text-gray-600">
              Revisa tu correo electrónico
            </p>
          </div>

          {/* Success Message */}
          <div className="card">
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                <p className="font-medium">Código de recuperación enviado</p>
                <p className="text-sm mt-1">
                  Hemos enviado un código de 6 dígitos a <strong>{email}</strong>
                </p>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>• El código expira en 15 minutos</p>
                <p>• Revisa tu carpeta de spam si no lo encuentras</p>
                <p>• No compartas este código con nadie</p>
              </div>

              <Link
                to="/reset-password"
                state={{ email }}
                className="btn-primary w-full py-3 text-lg"
              >
                Continuar con el código
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <Link 
              to="/login" 
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al login</span>
            </Link>
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
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="text-gray-600">
            No te preocupes, te ayudamos a recuperarla
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border-l-4 border-rose-400 text-rose-700 px-4 py-3 rounded-xl shadow-lg relative">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                  <button
                    onClick={() => setError('')}
                    className="ml-3 text-rose-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Te enviaremos un código de 6 dígitos para restablecer tu contraseña
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando código...' : 'Enviar código'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al login</span>
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

export default ForgotPassword
