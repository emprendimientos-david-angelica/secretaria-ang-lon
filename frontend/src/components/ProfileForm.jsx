import { useState, useEffect } from 'react'
import { Save, User, Mail, Phone, Camera, X, Lock, Eye, EyeOff } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import './PhoneInput.css'

function ProfileForm({ user, onSuccess, onCancel }) {
  const { setUser, logout } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    photo_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  // Estados para el modal de cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        photo_url: user.photo_url || ''
      })
    }
  }, [user])

  // Función para construir la URL completa de la foto
  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null
    // Si ya es una URL completa, devolverla tal como está
    if (photoUrl.startsWith('http')) return photoUrl
    // Si es una ruta relativa, construir la URL completa usando la base URL de la API
    if (photoUrl.startsWith('/api/upload/')) {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      return `${API_BASE_URL}${photoUrl}`
    }
    return photoUrl
  }

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

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF, WebP)')
        return
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Tamaño máximo: 5MB')
        return
      }

      setSelectedFile(file)
      setError('')

      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpload = async () => {
    if (!selectedFile) return

    setUploadingPhoto(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await api.post('/api/upload/profile-photo', formData)

      // Actualizar la URL de la foto en el estado
      setFormData(prev => ({
        ...prev,
        photo_url: response.data.photo_url
      }))

      // Actualizar el contexto de autenticación con la nueva foto
      setUser(prevUser => ({
        ...prevUser,
        photo_url: response.data.photo_url
      }))

      // Limpiar archivo seleccionado
      setSelectedFile(null)
      setPreviewUrl('')

    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Error al subir la foto'
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleDeletePhoto = async () => {
    try {
      await api.delete('/api/upload/profile-photo')
      setFormData(prev => ({
        ...prev,
        photo_url: ''
      }))
      
      // Actualizar el contexto de autenticación removiendo la foto
      setUser(prevUser => ({
        ...prevUser,
        photo_url: null
      }))
      
      setError('')
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Error al eliminar la foto'
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
    }
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
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Error al actualizar el perfil'
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
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
    setSelectedFile(null)
    setPreviewUrl('')
    setError('')
  }

  // Funciones para el modal de cambio de contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value
    })
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    })
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError('')

    // Validaciones
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      setPasswordLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres')
      setPasswordLoading(false)
      return
    }

    try {
      await api.put('/api/auth/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      })

      // Cerrar modal y limpiar datos
      setShowPasswordModal(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordError('')

      // Hacer logout para que el usuario vuelva a iniciar sesión
      logout()

    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Error al cambiar la contraseña'
      setPasswordError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
    } finally {
      setPasswordLoading(false)
    }
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setPasswordError('')
  }

  if (!user) return null

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
        {!isEditing && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <Lock className="h-4 w-4" />
              <span>Cambiar contraseña</span>
            </button>
            <button
              onClick={handleEdit}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>Editar</span>
            </button>
          </div>
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
            <label className="form-label">
              Foto de perfil
            </label>
            
            {/* Preview de la foto actual o seleccionada */}
            <div className="flex items-center space-x-4 mb-4">
              {(previewUrl || formData.photo_url) ? (
                <img
                  src={previewUrl || getPhotoUrl(formData.photo_url)}
                  alt="Preview"
                  className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="btn-secondary inline-flex items-center space-x-2 cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <span>Seleccionar foto</span>
                </label>
                
                {selectedFile && (
                  <div className="mt-2 space-x-2">
                    <button
                      type="button"
                      onClick={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="btn-primary text-sm disabled:opacity-50"
                    >
                      {uploadingPhoto ? 'Subiendo...' : 'Subir foto'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null)
                        setPreviewUrl('')
                      }}
                      className="btn-secondary text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
                
                {formData.photo_url && !selectedFile && (
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Eliminar foto actual
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              Formatos permitidos: JPG, PNG, GIF, WebP. Tamaño máximo: 5MB
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
            {(formData.photo_url || user.photo_url) ? (
              <img
                src={getPhotoUrl(formData.photo_url || user.photo_url)}
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

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Cambiar contraseña</h3>
                <button
                  onClick={closePasswordModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {passwordError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="form-label">
                    Contraseña actual
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      required
                      className="input-field pl-10 pr-10"
                      placeholder="Tu contraseña actual"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="form-label">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      required
                      className="input-field pl-10 pr-10"
                      placeholder="Mínimo 6 caracteres"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmar nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      required
                      className="input-field pl-10 pr-10"
                      placeholder="Repite la nueva contraseña"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="btn-secondary inline-flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock className="h-4 w-4" />
                    <span>{passwordLoading ? 'Cambiando...' : 'Cambiar contraseña'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileForm
