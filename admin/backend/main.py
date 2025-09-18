from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
import models
import schemas
import auth
import database
from database import get_db
import os

app = FastAPI(
    title="La Secretaria de AngLon - Admin API",
    description="API administrativa para gestión de usuarios y monitoreo del sistema",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://192.168.11.2:3001",
        "http://192.168.11.*:3001",
        "http://0.0.0.0:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Security
security = HTTPBearer()

# Dependencia para verificar token de admin
def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    user = auth.verify_token(token, db)
    if not user or not user.get('is_admin'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requieren permisos de administrador."
        )
    
    # Validar que el usuario esté activo
    if not user.get('is_active', True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo. Contacta al administrador del sistema."
        )
    
    return user

@app.get("/")
async def root():
    return {
        "message": "Bienvenido a La Secretaria de AngLon - Admin API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "admin-api"}

# Endpoint de autenticación
@app.post("/auth/login")
async def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login de administrador"""
    user = database.get_user_by_username(db, credentials.username)
    if not user or not user.get('is_admin'):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas o usuario no es administrador"
        )
    
    # Validar que el usuario esté activo
    if not user.get('is_active', True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo. Contacta al administrador del sistema."
        )
    
    if not auth.verify_password(credentials.password, user.get('hashed_password')):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.get('username')}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.get('id'),
            "username": user.get('username'),
            "email": user.get('email'),
            "is_admin": user.get('is_admin')
        }
    }

# Endpoints de gestión de usuarios
@app.get("/users", response_model=List[schemas.User])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Obtener todos los usuarios del sistema"""
    users = database.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/users/{user_id}", response_model=schemas.User)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Obtener un usuario específico por ID"""
    user = database.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

@app.post("/users", response_model=schemas.User)
async def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Crear un nuevo usuario"""
    return database.create_user(db, user)

@app.put("/users/{user_id}", response_model=schemas.User)
async def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Actualizar un usuario existente"""
    updated_user = database.update_user(db, user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return updated_user

@app.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Eliminar un usuario"""
    success = database.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": "Usuario eliminado exitosamente"}

@app.post("/users/{user_id}/change-password")
async def change_user_password(
    user_id: int,
    password_change: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Cambiar contraseña de un usuario"""
    success = database.change_user_password(db, user_id, password_change.new_password)
    if not success:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": "Contraseña cambiada exitosamente"}

# Endpoints de monitoreo del sistema
@app.get("/stats")
async def get_system_stats(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Obtener estadísticas del sistema"""
    stats = database.get_system_stats(db)
    return stats

@app.get("/logs")
async def get_system_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Obtener logs del sistema"""
    logs = database.get_system_logs(db, skip=skip, limit=limit)
    return logs

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
