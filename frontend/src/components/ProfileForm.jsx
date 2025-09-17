import { useState, useEffect } from 'react'
import { Save, User, Mail, Phone, Camera, X } from 'lucide-react'
import { api } from '../services/api'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import './PhoneInput.css'

function ProfileForm({ user, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    photo_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        photo_url: user.photo_url || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handlePhoneChange = (value) => {
    setFormData({
      ...formData,
      phone_number: value || ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.put('/api/auth/me', formData)
      onSuccess()
      setIsEditing(false)
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      full_name: user.full_name || '',
      phone_number: user.phone_number || '',
      photo_url: user.photo_url || ''
    })
    setError('')
  }

  if (!user) return null

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>Editar</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="full_name" className="form-label">
              Nombre completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="full_name"
                name="full_name"
                type="text"
                className="input-field pl-10"
                placeholder="Tu nombre completo"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone_number" className="form-label">
              Número de teléfono
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="CO"
                value={formData.phone_number}
                onChange={handlePhoneChange}
                placeholder="Ingresa tu número de teléfono"
                className="phone-input"
                style={{
                  '--PhoneInput-color--focus': '#3B82F6',
                  '--PhoneInputCountrySelect-marginRight': '0.5rem',
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Selecciona tu país y ingresa tu número de teléfono
            </p>
          </div>

          <div>
            <label htmlFor="photo_url" className="form-label">
              URL de la foto
            </label>
            <div className="relative">
              <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="photo_url"
                name="photo_url"
                type="url"
                className="input-field pl-10"
                placeholder="https://ejemplo.com/mi-foto.jpg"
                value={formData.photo_url}
                onChange={handleChange}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Ingresa la URL de tu foto de perfil
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancelar</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt="Foto de perfil"
                className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-10 w-10 text-primary-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user.full_name || 'Sin nombre'}
              </h3>
              <p className="text-gray-600">@{user.username}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-2" />
                Email
              </label>
              <p className="text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="inline h-4 w-4 mr-2" />
                Teléfono
              </label>
              <p className="text-gray-900">
                {user.phone_number || 'No especificado'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-2" />
                Usuario
              </label>
              <p className="text-gray-900">{user.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Activo
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileForm
