# 🗄️ Database Configuration - La Secretaria de AngLon

Esta carpeta contiene todos los scripts y configuraciones necesarias para manejar la base de datos de la aplicación, tanto para desarrollo local como para despliegue en la nube.

## 📁 Estructura de Archivos

```
database/
├── README.md                    # Este archivo
├── schema.sql                   # Script SQL completo de la base de datos
├── init_database.py             # Script Python de inicialización
├── deploy_database.sh           # Script de despliegue para la nube
├── alembic.ini                  # Configuración de Alembic
├── alembic/                     # Carpeta de migraciones
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
├── scripts/                     # Scripts adicionales
│   ├── backup_database.sh
│   ├── restore_database.sh
│   └── migrate_database.py
└── config/                      # Configuraciones específicas
    ├── development.env
    ├── production.env
    └── cloud.env
```

## 🚀 Uso Rápido

### 1. Inicialización Local
```bash
# Usar script Python
python database/init_database.py

# O usar script SQL directo
psql -d your_database -f database/schema.sql
```

### 2. Despliegue en la Nube
```bash
# Configurar variables de entorno
export DATABASE_URL="postgresql://user:password@your-cloud-host:5432/database"

# Ejecutar script de despliegue
chmod +x database/deploy_database.sh
./database/deploy_database.sh
```

### 3. Migraciones con Alembic
```bash
# Inicializar Alembic (solo la primera vez)
alembic init database/alembic

# Crear nueva migración
alembic revision --autogenerate -m "Descripción del cambio"

# Aplicar migraciones
alembic upgrade head
```

## 📊 Tablas de la Base de Datos

### Tablas Principales
- **users**: Usuarios del sistema
- **tasks**: Tareas de los usuarios
- **events**: Eventos del calendario
- **password_reset_codes**: Códigos de recuperación de contraseña

### Tablas de Administración
- **system_logs**: Logs del sistema para el panel de administración

## 🔧 Configuración

### Variables de Entorno Requeridas
```env
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Proveedores de Nube Soportados
- ✅ AWS RDS PostgreSQL
- ✅ Google Cloud SQL
- ✅ Azure Database for PostgreSQL
- ✅ Heroku Postgres
- ✅ DigitalOcean Managed Databases

## 📝 Notas Importantes

1. **Seguridad**: Nunca commitees credenciales reales al repositorio
2. **Backups**: Usa los scripts de backup antes de hacer cambios importantes
3. **Migraciones**: Siempre prueba las migraciones en un entorno de desarrollo primero
4. **Índices**: Los índices están optimizados para las consultas más comunes

## 🆘 Soporte

Si tienes problemas con la configuración de la base de datos, revisa:
1. Las variables de entorno están configuradas correctamente
2. La conexión a la base de datos es exitosa
3. Los permisos del usuario de base de datos son suficientes

