from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Text, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import text
from typing import List, Optional
import os
from datetime import datetime

# Configuración de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://secretaria_user:secretaria_password@postgres:5432/secretaria_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Funciones de gestión de usuarios
def get_users(db: Session, skip: int = 0, limit: int = 100):
    """Obtener todos los usuarios"""
    try:
        result = db.execute(
            text("""
                SELECT id, username, email, full_name, phone_number, photo_url, is_active, is_admin, created_at, updated_at 
                FROM users 
                ORDER BY created_at DESC 
                LIMIT :limit OFFSET :skip
            """),
            {"limit": limit, "skip": skip}
        )
        users = []
        for row in result:
            users.append({
                "id": row.id,
                "username": row.username,
                "email": row.email,
                "full_name": row.full_name,
                "phone_number": row.phone_number,
                "photo_url": row.photo_url,
                "is_active": row.is_active,
                "is_admin": row.is_admin,
                "created_at": row.created_at if row.created_at else datetime.utcnow(),
                "updated_at": row.updated_at if row.updated_at else datetime.utcnow()
            })
        return users
    except Exception as e:
        print(f"Error getting users: {e}")
        return []

def get_user(db: Session, user_id: int):
    """Obtener un usuario por ID"""
    try:
        result = db.execute(
            text("""
                SELECT id, username, email, full_name, phone_number, photo_url, is_active, is_admin, created_at, updated_at 
                FROM users 
                WHERE id = :user_id
            """),
            {"user_id": user_id}
        ).first()
        
        if result:
            return {
                "id": result.id,
                "username": result.username,
                "email": result.email,
                "full_name": result.full_name,
                "phone_number": result.phone_number,
                "photo_url": result.photo_url,
                "is_active": result.is_active,
                "is_admin": result.is_admin,
                "created_at": result.created_at if result.created_at else datetime.utcnow(),
                "updated_at": result.updated_at if result.updated_at else datetime.utcnow()
            }
        return None
    except Exception as e:
        print(f"Error getting user: {e}")
        return None

def get_user_by_username(db: Session, username: str):
    """Obtener un usuario por nombre de usuario"""
    try:
        result = db.execute(
            text("""
                SELECT id, username, email, full_name, hashed_password, is_active, is_admin, created_at, updated_at 
                FROM users 
                WHERE username = :username
            """),
            {"username": username}
        ).first()
        
        if result:
            return {
                "id": result.id,
                "username": result.username,
                "email": result.email,
                "full_name": result.full_name,
                "hashed_password": result.hashed_password,
                "is_active": result.is_active,
                "is_admin": result.is_admin,
                "created_at": result.created_at if result.created_at else datetime.utcnow(),
                "updated_at": result.updated_at if result.updated_at else datetime.utcnow()
            }
        return None
    except Exception as e:
        print(f"Error getting user by username: {e}")
        return None

def create_user(db: Session, user_data):
    """Crear un nuevo usuario"""
    try:
        # Hash de la contraseña
        from auth import get_password_hash
        hashed_password = get_password_hash(user_data.password)
        
        # Generar username automáticamente si no se proporciona
        username = user_data.username
        if not username:
            # Usar el prefijo del email como base para el username
            email_prefix = user_data.email.split('@')[0]
            username = email_prefix
            
            # Verificar si el username ya existe y agregar un número si es necesario
            counter = 1
            original_username = username
            while True:
                existing_user = db.execute(
                    text("SELECT id FROM users WHERE username = :username"),
                    {"username": username}
                ).first()
                if not existing_user:
                    break
                username = f"{original_username}{counter}"
                counter += 1
        
        # Insertar usuario
        result = db.execute(
            text("""
                INSERT INTO users (username, email, full_name, phone_number, hashed_password, is_active, is_admin, created_at, updated_at)
                VALUES (:username, :email, :full_name, :phone_number, :hashed_password, :is_active, :is_admin, NOW(), NOW())
                RETURNING id, username, email, full_name, phone_number, is_active, is_admin, created_at, updated_at
            """),
            {
                "username": username,
                "email": user_data.email,
                "full_name": user_data.full_name,
                "phone_number": getattr(user_data, 'phone_number', None),
                "hashed_password": hashed_password,
                "is_active": user_data.is_active,
                "is_admin": user_data.is_admin
            }
        )
        
        db.commit()
        new_user = result.first()
        
        return {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "phone_number": new_user.phone_number,
            "is_active": new_user.is_active,
            "is_admin": new_user.is_admin,
            "created_at": new_user.created_at.isoformat() if new_user.created_at else None,
            "updated_at": new_user.updated_at.isoformat() if new_user.updated_at else None
        }
    except Exception as e:
        db.rollback()
        print(f"Error creating user: {e}")
        raise e

def update_user(db: Session, user_id: int, user_data):
    """Actualizar un usuario"""
    try:
        # Construir query dinámico
        update_fields = []
        params = {"user_id": user_id}
        
        if user_data.username is not None:
            update_fields.append("username = :username")
            params["username"] = user_data.username
        
        if user_data.email is not None:
            update_fields.append("email = :email")
            params["email"] = user_data.email
        
        if user_data.full_name is not None:
            update_fields.append("full_name = :full_name")
            params["full_name"] = user_data.full_name
        
        if user_data.phone_number is not None:
            update_fields.append("phone_number = :phone_number")
            params["phone_number"] = user_data.phone_number
        
        if user_data.is_active is not None:
            update_fields.append("is_active = :is_active")
            params["is_active"] = user_data.is_active
        
        if user_data.is_admin is not None:
            update_fields.append("is_admin = :is_admin")
            params["is_admin"] = user_data.is_admin
        
        # Manejar cambio de contraseña si se proporciona
        if hasattr(user_data, 'password') and user_data.password:
            from auth import get_password_hash
            hashed_password = get_password_hash(user_data.password)
            update_fields.append("hashed_password = :hashed_password")
            params["hashed_password"] = hashed_password
        
        if not update_fields:
            return get_user(db, user_id)
        
        update_fields.append("updated_at = NOW()")
        
        query = f"""
            UPDATE users 
            SET {', '.join(update_fields)}
            WHERE id = :user_id
            RETURNING id, username, email, full_name, is_active, is_admin, created_at, updated_at
        """
        
        result = db.execute(text(query), params)
        db.commit()
        
        updated_user = result.first()
        if updated_user:
            return {
                "id": updated_user.id,
                "username": updated_user.username,
                "email": updated_user.email,
                "full_name": updated_user.full_name,
                "is_active": updated_user.is_active,
                "is_admin": updated_user.is_admin,
                "created_at": updated_user.created_at.isoformat() if updated_user.created_at else None,
                "updated_at": updated_user.updated_at.isoformat() if updated_user.updated_at else None
            }
        return None
    except Exception as e:
        db.rollback()
        print(f"Error updating user: {e}")
        raise e

def delete_user(db: Session, user_id: int):
    """Eliminar un usuario"""
    try:
        result = db.execute(
            text("DELETE FROM users WHERE id = :user_id"),
            {"user_id": user_id}
        )
        db.commit()
        return result.rowcount > 0
    except Exception as e:
        db.rollback()
        print(f"Error deleting user: {e}")
        raise e

def change_user_password(db: Session, user_id: int, new_password: str):
    """Cambiar contraseña de un usuario"""
    try:
        from auth import get_password_hash
        hashed_password = get_password_hash(new_password)
        
        result = db.execute(
            text("""
                UPDATE users 
                SET hashed_password = :hashed_password, updated_at = NOW()
                WHERE id = :user_id
            """),
            {
                "user_id": user_id,
                "hashed_password": hashed_password
            }
        )
        db.commit()
        return result.rowcount > 0
    except Exception as e:
        db.rollback()
        print(f"Error changing password: {e}")
        raise e

# Funciones de monitoreo del sistema
def get_system_stats(db: Session):
    """Obtener estadísticas del sistema"""
    # Aquí implementarías consultas reales a la base de datos
    # Por ahora retornamos datos mock
    return {
        "total_users": 5,
        "active_users": 4,
        "admin_users": 1,
        "total_tasks": 12,
        "total_events": 8,
        "system_uptime": "2 días, 5 horas"
    }

def get_system_logs(db: Session, skip: int = 0, limit: int = 100):
    """Obtener logs del sistema"""
    # Aquí implementarías consultas reales a la base de datos
    # Por ahora retornamos datos mock
    return [
        {
            "id": 1,
            "level": "INFO",
            "message": "Usuario admin inició sesión",
            "action": "LOGIN",
            "user_id": 1,
            "timestamp": datetime.utcnow()
        },
        {
            "id": 2,
            "level": "INFO",
            "message": "Nuevo usuario creado",
            "action": "CREATE",
            "user_id": 2,
            "timestamp": datetime.utcnow()
        }
    ]
