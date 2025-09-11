import React, { useState, useEffect } from 'react'
import { Users, Settings, BarChart3, Activity, Shield, Home, ArrowLeft } from 'lucide-react'
import UsersList from './components/UsersList'
import UserForm from './components/UserForm'
import Login from './components/Login'
import { usersService, systemService, authService } from './services/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard')
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formMode, setFormMode] = useState('create')

  useEffect(() => {
    // Verificar si hay un token válido al cargar la aplicación
    if (authService.isAuthenticated()) {
      setIsAuthenticated(true)
      // Aquí podrías obtener los datos del usuario actual
    }
  }, [])

  const handleLoginSuccess = (response) => {
    setIsAuthenticated(true)
    setCurrentUser(response.user)
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    setCurrentUser(null)
  }

  const handleManageUsers = () => {
    setCurrentView('users')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setFormMode('create')
    setShowUserForm(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setFormMode('edit')
    setShowUserForm(true)
  }

  const handleViewUser = (user) => {
    alert(`Viendo usuario: ${user.full_name}\nEmail: ${user.email}\nRol: ${user.is_admin ? 'Administrador' : 'Usuario'}`)
  }

  const handleSaveUser = async (userData) => {
    try {
      if (formMode === 'create') {
        await usersService.createUser(userData)
        alert(`Usuario creado exitosamente:\n${userData.full_name} (${userData.username})`)
      } else {
        await usersService.updateUser(editingUser.id, userData)
        alert(`Usuario actualizado exitosamente:\n${userData.full_name} (${userData.username})`)
      }
      setShowUserForm(false)
      setEditingUser(null)
      // Recargar la lista de usuarios
      if (onRefreshUsers) {
        onRefreshUsers()
      }
    } catch (error) {
      alert(`Error al ${formMode === 'create' ? 'crear' : 'actualizar'} usuario: ${error.message}`)
      console.error('Error saving user:', error)
    }
  }

  const handleCancelUserForm = () => {
    setShowUserForm(false)
    setEditingUser(null)
  }

  const onRefreshUsers = () => {
    // Esta función se pasará a UsersList para recargar usuarios
    // La implementación está en UsersList
  }

  const renderDashboard = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Usuarios
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">5</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Usuarios Activos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">4</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Tareas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">12</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Settings className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Eventos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">8</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Acciones Administrativas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleManageUsers}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              Gestionar Usuarios
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Estadísticas
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
              <Activity className="h-4 w-4 mr-2" />
              Ver Logs
            </button>
          </div>
        </div>
      </div>
    </>
  )

  const renderUsersView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={handleBackToDashboard}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
        </div>
      </div>
      
      <UsersList
        onEditUser={handleEditUser}
        onCreateUser={handleCreateUser}
        onViewUser={handleViewUser}
        onRefresh={onRefreshUsers}
      />
    </div>
  )

  // Si no está autenticado, mostrar el login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-rose-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                La Secretaria de AngLon - Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{currentUser?.username || 'Admin User'}</span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {currentView === 'dashboard' ? renderDashboard() : renderUsersView()}
      </main>

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={editingUser}
          mode={formMode}
          onSave={handleSaveUser}
          onCancel={handleCancelUserForm}
        />
      )}
    </div>
  )
}

export default App
