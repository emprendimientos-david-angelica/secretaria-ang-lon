import { useState, useEffect } from 'react'
import { 
  CheckSquare, 
  Square, 
  Edit, 
  Trash2, 
  Plus,
  Calendar,
  Flag,
  Clock
} from 'lucide-react'
import { api } from '../services/api'
import TaskForm from './TaskForm'

function TasksList({ limit }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/tasks/')
      const tasksData = limit ? response.data.slice(0, limit) : response.data
      setTasks(tasksData)
    } catch (error) {
      console.error('Error al obtener tareas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (taskId) => {
    try {
      await api.patch(`/api/tasks/${taskId}/toggle`)
      fetchTasks() // Refrescar la lista
    } catch (error) {
      console.error('Error al cambiar estado de tarea:', error)
    }
  }

  const handleDelete = async (taskId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await api.delete(`/api/tasks/${taskId}`)
        fetchTasks() // Refrescar la lista
      } catch (error) {
        console.error('Error al eliminar tarea:', error)
      }
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleFormSuccess = () => {
    setShowTaskForm(false)
    setEditingTask(null)
    fetchTasks()
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return '🔴'
      case 'medium':
        return '🟡'
      case 'low':
        return '🟢'
      default:
        return '⚪'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas</h3>
        <p className="text-gray-500 mb-4">Comienza creando tu primera tarea</p>
        <button
          onClick={() => setShowTaskForm(true)}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Tarea</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!limit && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mis Tareas</h2>
          <button
            onClick={() => setShowTaskForm(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>
      )}
      
      {limit && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowTaskForm(true)}
            className="btn-primary inline-flex items-center space-x-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>
      )}

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`card p-4 transition-all duration-200 hover:shadow-md ${
              task.is_completed ? 'bg-gray-50' : ''
            }`}
          >
            <div className="flex items-start space-x-3">
              <button
                onClick={() => handleToggleComplete(task.id)}
                className="mt-1 text-primary-600 hover:text-primary-700 transition-colors"
              >
                {task.is_completed ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${
                      task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`text-sm mt-1 ${
                        task.is_completed ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      {task.due_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(task.due_date).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        <Flag className="h-3 w-3" />
                        <span className="capitalize">{task.priority}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-gray-400 hover:text-primary-600 transition-colors p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de formulario */}
      {showTaskForm && (
        <TaskForm
          isOpen={showTaskForm}
          onClose={() => {
            setShowTaskForm(false)
            setEditingTask(null)
          }}
          onSuccess={handleFormSuccess}
          task={editingTask}
        />
      )}
    </div>
  )
}

export default TasksList
