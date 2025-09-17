import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Edit, 
  Trash2, 
  Plus,
  Clock,
  MapPin,
  CalendarDays
} from 'lucide-react'
import { api } from '../services/api'
import EventForm from './EventForm'
import { format, isToday, isTomorrow, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'

function EventsList({ limit, showForm = false, onFormClose }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEventForm, setShowEventForm] = useState(showForm)
  const [editingEvent, setEditingEvent] = useState(null)

  // Sincronizar con la prop showForm
  useEffect(() => {
    setShowEventForm(showForm)
  }, [showForm])

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/events/')
      const eventsData = limit ? response.data.slice(0, limit) : response.data
      // Ordenar por fecha
      const sortedEvents = eventsData.sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
      setEvents(sortedEvents)
    } catch (error) {
      console.error('Error al obtener eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (eventId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await api.delete(`/api/events/${eventId}`)
        fetchEvents() // Refrescar la lista
      } catch (error) {
        console.error('Error al eliminar evento:', error)
      }
    }
  }

  const handleEdit = (event) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }

  const handleFormSuccess = () => {
    setShowEventForm(false)
    setEditingEvent(null)
    fetchEvents()
    // Notificar al componente padre si se proporciona el callback
    if (onFormClose) {
      onFormClose()
    }
  }

  const getRelativeDate = (date) => {
    const eventDate = new Date(date)
    
    if (isToday(eventDate)) {
      return 'Hoy'
    } else if (isTomorrow(eventDate)) {
      return 'Mañana'
    } else if (isYesterday(eventDate)) {
      return 'Ayer'
    } else {
      return format(eventDate, 'EEEE d \'de\' MMMM', { locale: es })
    }
  }

  const getTimeString = (date) => {
    return format(new Date(date), 'HH:mm')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <>
        <div className="text-center py-8">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos</h3>
          <p className="text-gray-500 mb-4">Comienza creando tu primer evento</p>
          <button
            onClick={() => setShowEventForm(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Evento</span>
          </button>
        </div>

        {/* Modal de formulario */}
        {showEventForm && (
          <EventForm
            isOpen={showEventForm}
            onClose={() => {
              setShowEventForm(false)
              setEditingEvent(null)
            }}
            onSuccess={handleFormSuccess}
            event={editingEvent}
          />
        )}
      </>
    )
  }

  return (
    <div className="space-y-4">
      {!limit && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mis Eventos</h2>
          <button
            onClick={() => setShowEventForm(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Evento</span>
          </button>
        </div>
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="card p-4 transition-all duration-200 hover:shadow-md border-l-4 border-primary-500"
          >
            <div className="flex items-start space-x-3">
              <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{getRelativeDate(event.event_date)} a las {getTimeString(event.event_date)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.is_all_day && (
                        <div className="flex items-center space-x-1">
                          <CalendarDays className="h-3 w-3" />
                          <span>Todo el día</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-gray-400 hover:text-primary-600 transition-colors p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
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
      {showEventForm && (
        <EventForm
          isOpen={showEventForm}
          onClose={() => {
            setShowEventForm(false)
            setEditingEvent(null)
          }}
          onSuccess={handleFormSuccess}
          event={editingEvent}
        />
      )}
    </div>
  )
}

export default EventsList
