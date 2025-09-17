#!/usr/bin/env python3
"""
Script para actualizar las contraseñas de usuarios existentes
después de actualizar bcrypt
"""

from database import SessionLocal
from models import User
from auth import get_password_hash

def update_user_passwords():
    """Actualiza las contraseñas de todos los usuarios con el nuevo hash de bcrypt"""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        
        # Contraseñas por defecto para cada usuario
        default_passwords = {
            "david.timana": "david123",
            "kevinlondoño": "kevin123", 
            "angelica": "angelica123",
            "admin": "admin123"
        }
        
        for user in users:
            if user.username in default_passwords:
                new_password = default_passwords[user.username]
                user.hashed_password = get_password_hash(new_password)
                print(f"Actualizada contraseña para usuario: {user.username}")
            else:
                # Para usuarios no listados, usar una contraseña por defecto
                user.hashed_password = get_password_hash("password123")
                print(f"Actualizada contraseña por defecto para usuario: {user.username}")
        
        db.commit()
        print("✅ Todas las contraseñas han sido actualizadas exitosamente")
        
        # Mostrar las credenciales actualizadas
        print("\n📋 Credenciales de acceso:")
        print("-" * 40)
        for username, password in default_passwords.items():
            print(f"Usuario: {username}")
            print(f"Contraseña: {password}")
            print("-" * 40)
            
    except Exception as e:
        print(f"❌ Error al actualizar contraseñas: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_user_passwords()
