import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
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
import TaskForm from '../components/TaskForm'
import EventForm from '../components/EventForm'

function Dashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)

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
            { id: 'overview', name: 'Vista General' },
            { id: 'tasks', name: 'Tareas' },
            { id: 'events', name: 'Eventos' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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
                  onClick={() => setActiveTab('tasks')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Ver todas
                </button>
              </div>
              <TasksList limit={5} />
            </div>

            {/* Eventos Próximos */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Eventos Próximos</h3>
                <button
                  onClick={() => setActiveTab('events')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Ver todos
                </button>
              </div>
              <EventsList limit={5} />
            </div>
          </div>
        )}

        {activeTab === 'tasks' && <TasksList />}
        {activeTab === 'events' && <EventsList />}
      </div>

      {/* Modales */}
      {showTaskForm && (
        <TaskForm
          isOpen={showTaskForm}
          onClose={() => setShowTaskForm(false)}
          onSuccess={() => {
            setShowTaskForm(false)
            // Aquí podrías refrescar la lista de tareas
          }}
        />
      )}

      {showEventForm && (
        <EventForm
          isOpen={showEventForm}
          onClose={() => setShowEventForm(false)}
          onSuccess={() => {
            setShowEventForm(false)
            // Aquí podrías refrescar la lista de eventos
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
