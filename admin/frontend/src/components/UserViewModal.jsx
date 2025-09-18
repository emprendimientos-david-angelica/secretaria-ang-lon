import React from 'react'
import { X, User, Mail, Calendar, Shield, CheckCircle, XCircle, Camera } from 'lucide-react'

const UserViewModal = ({ user, onClose }) => {
  if (!user) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null
    // Si ya es una URL completa, devolverla tal como está
    if (photoUrl.startsWith('http')) return photoUrl
    // Si es una ruta relativa, construir la URL completa usando la base URL del backend principal
    if (photoUrl.startsWith('/api/upload/')) {
      // Las fotos están en el backend principal (puerto 8000), no en el administrativo (puerto 8001)
      const MAIN_API_BASE_URL = 'http://localhost:8000'
      return `${MAIN_API_BASE_URL}${photoUrl}`
    }
    return photoUrl
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Detalles del Usuario</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Photo and Basic Info */}
          <div className="flex items-start space-x-6 mb-8">
            <div className="flex-shrink-0">
              {user.photo_url ? (
                <img
                  src={getPhotoUrl(user.photo_url)}
                  alt="Foto de perfil"
                  className="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div 
                className={`h-24 w-24 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center border-4 border-gray-200 ${user.photo_url ? 'hidden' : 'flex'}`}
              >
                <Camera className="h-12 w-12 text-rose-400" />
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                {user.full_name || 'Sin nombre'}
              </h4>
              <p className="text-lg text-gray-600 mb-1">@{user.username}</p>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Activo
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Inactivo
                    </>
                  )}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_admin
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <Shield className="h-4 w-4 mr-1" />
                  {user.is_admin ? 'Administrador' : 'Usuario'}
                </span>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Correo Electrónico
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {user.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-2" />
                  Nombre de Usuario
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {user.username}
                </p>
              </div>

              {user.phone_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📱 Teléfono
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {user.phone_number}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Fecha de Creación
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {formatDate(user.created_at)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Última Actualización
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {formatDate(user.updated_at)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔐 Contraseña
                </label>
                <p className="text-gray-500 bg-gray-50 px-3 py-2 rounded-md italic">
                  ••••••••••••
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Por seguridad, la contraseña no se muestra
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserViewModal
