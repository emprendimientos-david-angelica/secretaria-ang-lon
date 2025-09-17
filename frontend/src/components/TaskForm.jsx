import { useState, useEffect } from 'react'
import { X, Save, Calendar, Flag } from 'lucide-react'
import { api } from '../services/api'

function TaskForm({ isOpen, onClose, onSuccess, task }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    due_time: '',
    priority: 'medium'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!task

  useEffect(() => {
    if (task) {
      const taskDate = task.due_date ? new Date(task.due_date) : null
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: taskDate ? taskDate.toISOString().split('T')[0] : '',
        due_time: taskDate ? taskDate.toTimeString().slice(0, 5) : '',
        priority: task.priority || 'medium'
      })
    } else {
      setFormData({
        title: '',
        description: '',
        due_date: '',
        due_time: '',
        priority: 'medium'
      })
    }
  }, [task])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Preparar datos para envío
      const submitData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority
      }

      // Combinar fecha y hora si ambos están presentes
      if (formData.due_date) {
        if (formData.due_time) {
          // Combinar fecha y hora
          submitData.due_date = `${formData.due_date}T${formData.due_time}:00`
        } else {
          // Solo fecha (sin hora específica)
          submitData.due_date = `${formData.due_date}T00:00:00`
        }
      }

      if (isEditing) {
        await api.put(`/api/tasks/${task.id}`, submitData)
      } else {
        await api.post('/api/tasks/', submitData)
      }
      
      onSuccess()
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al guardar la tarea')
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
                {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
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
                  Título *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="input-field"
                  placeholder="¿Qué necesitas hacer?"
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
                  placeholder="Detalles adicionales..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="due_date" className="form-label">
                    Fecha límite
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="due_date"
                      name="due_date"
                      type="date"
                      className="input-field pl-10"
                      value={formData.due_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="due_time" className="form-label">
                    Hora límite
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="due_time"
                      name="due_time"
                      type="time"
                      className="input-field pl-10"
                      value={formData.due_time}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="priority" className="form-label">
                  Prioridad
                </label>
                <div className="relative">
                  <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="priority"
                    name="priority"
                    className="input-field pl-10"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
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

export default TaskForm
