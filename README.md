# La Secretaria de AngLon 🎀

Una aplicación web fullstack que funciona como tu secretaria personal digital, ayudándote a recordar tareas, eventos y compromisos de manera organizada y confiable.

## 🚀 Características

- **Gestión de Tareas**: Crea, edita y organiza tus tareas diarias
- **Calendario de Eventos**: Mantén un registro de todos tus compromisos
- **Dashboard Intuitivo**: Interfaz moderna y amigable con tonos rosados
- **Autenticación Segura**: Sistema de login y registro con JWT
- **Responsive Design**: Funciona perfectamente en escritorio y móvil
- **Preparado para Escalar**: Arquitectura preparada para SaaS multiusuario

## 🛠️ Tecnologías

### Frontend
- React 18 + Vite
- TailwindCSS
- Lucide React (iconos)
- React Router DOM

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication

### Infraestructura
- Docker & Docker Compose
- PostgreSQL
- Variables de entorno (.env)

## 🚀 Instalación y Uso

### Prerrequisitos
- Docker y Docker Compose instalados
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd secretaria-ang-lon
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. **Levantar la aplicación**
```bash
docker-compose up -d
```

4. **Acceder a la aplicación**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Documentación API: http://localhost:8000/docs

## 📁 Estructura del Proyecto

```
secretaria-ang-lon/
├── frontend/                 # Aplicación React
├── backend/                  # API FastAPI
├── docker-compose.yml        # Configuración Docker
├── .env.example             # Variables de entorno de ejemplo
└── README.md                # Este archivo
```

## 🔧 Desarrollo

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🐳 Docker

La aplicación está completamente contenerizada:

- **Frontend**: Puerto 3000
- **Backend**: Puerto 8000  
- **PostgreSQL**: Puerto 5432

## 📱 Características Futuras

- Asistente inteligente con IA
- Recomendaciones proactivas
- Planes de suscripción premium
- Integración con calendarios externos
- Notificaciones push
- Sincronización multi-dispositivo

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

Si tienes alguna pregunta o necesitas ayuda, por favor abre un issue en el repositorio.

---

**La Secretaria de AngLon** - Tu asistente digital de confianza 💕
