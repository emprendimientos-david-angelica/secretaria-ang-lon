import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  CheckSquare, 
  Calendar, 
  Plus, 
  Clock, 
  MapPin,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import TasksList from '../components/TasksList'
import EventsList from '../components/EventsList'

function Dashboard() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)

  // Actualizar pestaña activa basada en la URL
  useEffect(() => {
    const path = location.pathname
    if (path === '/dashboard/tasks') {
      setActiveTab('tasks')
    } else if (path === '/dashboard/events') {
      setActiveTab('events')
    } else if (path === '/dashboard/profile') {
      setActiveTab('profile')
    } else {
      setActiveTab('overview')
    }
    
    // Resetear estados de modales al cambiar de pestaña
    setShowTaskForm(false)
    setShowEventForm(false)
  }, [location.pathname])

  const stats = [
    {
      name: 'Tareas Pendientes',
      value: '12',
      change: '+2',
      changeType: 'increase',
      icon: CheckSquare,
      color: 'primary'
    },
    {
      name: 'Eventos Hoy',
      value: '3',
      change: '+1',
      changeType: 'increase',
      icon: Calendar,
      color: 'rose'
    },
    {
      name: 'Productividad',
      value: '85%',
      change: '+5%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'green'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="bg-gradient-to-r from-primary-500 to-rose-500 rounded-3xl p-8 text-white">
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-12 w-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">¡Hola, {user?.full_name || user?.username}!</h1>
            <p className="text-primary-100">Tu secretaria personal está aquí para ayudarte</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Tarea</span>
          </button>
          <button
            onClick={() => setShowEventForm(true)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Evento</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} desde ayer
                </p>
              </div>
              <div className={`h-12 w-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs de Navegación */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Vista General', path: '/dashboard' },
            { id: 'tasks', name: 'Tareas', path: '/dashboard/tasks' },
            { id: 'events', name: 'Eventos', path: '/dashboard/events' },
            { id: 'profile', name: 'Perfil', path: '/dashboard/profile' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de los Tabs */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tareas Recientes */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tareas Recientes</h3>
                <button
                  onClick={() => navigate('/dashboard/tasks')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Ver todas
                </button>
              </div>
              <TasksList 
                limit={5} 
                showForm={showTaskForm} 
                onFormClose={() => setShowTaskForm(false)} 
              />
            </div>

            {/* Eventos Próximos */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Eventos Próximos</h3>
                <button
                  onClick={() => navigate('/dashboard/events')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Ver todos
                </button>
              </div>
              <EventsList 
                limit={5} 
                showForm={showEventForm} 
                onFormClose={() => setShowEventForm(false)} 
              />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <TasksList 
            showForm={showTaskForm} 
            onFormClose={() => setShowTaskForm(false)} 
          />
        )}
        {activeTab === 'events' && (
          <EventsList 
            showForm={showEventForm} 
            onFormClose={() => setShowEventForm(false)} 
          />
        )}
        {activeTab === 'profile' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mi Perfil</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                <p className="text-gray-900">{user?.full_name || 'No especificado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                <p className="text-gray-900">{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Activo
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default Dashboard
