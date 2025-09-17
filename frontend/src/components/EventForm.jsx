import { useState, useEffect } from 'react'
import { X, Save, Calendar, MapPin, Clock } from 'lucide-react'
import { api } from '../services/api'

function EventForm({ isOpen, onClose, onSuccess, event }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    is_all_day: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!event

  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.event_date)
      setFormData({
        title: event.title || '',
        description: event.description || '',
        event_date: eventDate.toISOString().split('T')[0],
        event_time: event.is_all_day ? '' : eventDate.toTimeString().slice(0, 5),
        location: event.location || '',
        is_all_day: event.is_all_day || false
      })
    } else {
      // Establecer solo fecha por defecto (mañana), sin hora
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      setFormData({
        title: '',
        description: '',
        event_date: tomorrow.toISOString().split('T')[0],
        event_time: '',
        location: '',
        is_all_day: false
      })
    }
  }, [event])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Preparar datos para la API
      const apiData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        is_all_day: formData.is_all_day
      }

      // Combinar fecha y hora si no es todo el día
      if (!formData.is_all_day && formData.event_time) {
        const dateTimeString = `${formData.event_date}T${formData.event_time}:00`
        apiData.event_date = dateTimeString
      } else {
        // Si es todo el día, usar solo la fecha
        apiData.event_date = `${formData.event_date}T00:00:00`
      }

      if (isEditing) {
        await api.put(`/api/events/${event.id}`, apiData)
      } else {
        await api.post('/api/events/', apiData)
      }
      
      onSuccess()
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al guardar el evento')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="title" className="form-label">
                  Título del evento *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="input-field"
                  placeholder="¿Qué evento vas a tener?"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  className="input-field resize-none"
                  placeholder="Detalles del evento..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event_date" className="form-label">
                    Fecha *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="event_date"
                      name="event_date"
                      type="date"
                      required
                      className="input-field pl-10"
                      value={formData.event_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="event_time" className="form-label">
                    Hora
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="event_time"
                      name="event_time"
                      type="time"
                      className="input-field pl-10"
                      value={formData.event_time}
                      onChange={handleChange}
                      disabled={formData.is_all_day}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="form-label">
                  Ubicación
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="location"
                    name="location"
                    type="text"
                    className="input-field pl-10"
                    placeholder="¿Dónde será el evento?"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="is_all_day"
                  name="is_all_day"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={formData.is_all_day}
                  onChange={handleChange}
                />
                <label htmlFor="is_all_day" className="ml-2 block text-sm text-gray-900">
                  Evento de todo el día
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventForm
