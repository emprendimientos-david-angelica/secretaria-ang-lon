#!/usr/bin/env python3
"""
Script de inicialización de base de datos para La Secretaria de AngLon
Este script crea todas las tablas necesarias basadas en los modelos SQLAlchemy
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
import logging

# Agregar el directorio padre al path para importar módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importar configuración
from backend.config import settings

# Crear Base directamente aquí para evitar problemas de importación
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()

# Importar modelos después de crear Base
from backend.models import User, Task, Event, PasswordResetCode

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_database():
    """Crear la base de datos si no existe"""
    try:
        db_url = settings.DATABASE_URL
        if db_url.startswith('postgresql://'):
            # Parsear URL para obtener componentes
            parts = db_url.replace('postgresql://', '').split('@')
            if len(parts) == 2:
                user_pass, host_db = parts
                user, password = user_pass.split(':')
                host_port, database = host_db.split('/')
                host, port = host_port.split(':')
                
                # Crear conexión sin especificar base de datos
                admin_url = f"postgresql://{user}:{password}@{host}:{port}/postgres"
                admin_engine = create_engine(admin_url)
                
                # Crear base de datos si no existe
                with admin_engine.connect() as conn:
                    conn.execute(text("COMMIT"))  # Terminar transacción
                    conn.execute(text(f"CREATE DATABASE {database}"))
                    logger.info(f"Base de datos '{database}' creada exitosamente")
                    
    except SQLAlchemyError as e:
        if "already exists" in str(e):
            logger.info("La base de datos ya existe")
        else:
            logger.error(f"Error creando base de datos: {e}")
            raise

def create_tables():
    """Crear todas las tablas basadas en los modelos"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        # Crear todas las tablas
        Base.metadata.create_all(bind=engine)
        logger.info("Todas las tablas creadas exitosamente")
        
        # Verificar tablas creadas
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]
            logger.info(f"Tablas creadas: {', '.join(tables)}")
            
    except SQLAlchemyError as e:
        logger.error(f"Error creando tablas: {e}")
        raise

def create_indexes():
    """Crear índices adicionales para optimizar consultas"""
    try:
        engine = create_engine(settings.DATABASE_URL)
        
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON tasks(owner_id)",
            "CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)",
            "CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed)",
            "CREATE INDEX IF NOT EXISTS idx_events_owner_id ON events(owner_id)",
            "CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date)",
            "CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email ON password_reset_codes(email)",
            "CREATE INDEX IF NOT EXISTS idx_password_reset_codes_expires_at ON password_reset_codes(expires_at)",
            "CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp)",
            "CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id)"
        ]
        
        with engine.connect() as conn:
            for index_sql in indexes:
                conn.execute(text(index_sql))
                conn.commit()
                
        logger.info("Índices creados exitosamente")
        
    except SQLAlchemyError as e:
        logger.error(f"Error creando índices: {e}")
        raise

def main():
    """Función principal"""
    try:
        logger.info("Iniciando creación de base de datos...")
        
        # 1. Crear base de datos
        create_database()
        
        # 2. Crear tablas
        create_tables()
        
        # 3. Crear índices
        create_indexes()
        
        logger.info("✅ Base de datos inicializada exitosamente")
        
    except Exception as e:
        logger.error(f"❌ Error inicializando base de datos: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
