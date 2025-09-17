from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, Token, User as UserSchema, UserUpdate
from auth import verify_password, get_password_hash, create_access_token
from config import settings
from dependencies import get_current_user

router = APIRouter()

@router.post("/register", response_model=UserSchema)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Registra un nuevo usuario"""
    # Verificar si el usuario ya existe
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está en uso"
        )
    
    # Crear nuevo usuario
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Autentica un usuario y devuelve un token JWT"""
    print(f"Login intento con email: {user_credentials.email}")
    
    # Buscar usuario por email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user:
        print(f"Usuario no encontrado con email: {user_credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"Usuario encontrado: {user.email}, username: {user.username}")
    
    if not verify_password(user_credentials.password, user.hashed_password):
        print("Contraseña incorrecta")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        print("Usuario inactivo")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    
    print("Login exitoso")
    
    # Crear token de acceso usando email como identificador
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Obtiene información del usuario actual"""
    return current_user

@router.put("/me", response_model=UserSchema)
def update_current_user_info(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Actualiza la información del usuario actual"""
    # Actualizar solo los campos proporcionados
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Verificar si el email ya está en uso por otro usuario
    if "email" in update_data:
        existing_user = db.query(User).filter(
            User.email == update_data["email"],
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
    
    # Verificar si el username ya está en uso por otro usuario
    if "username" in update_data:
        existing_user = db.query(User).filter(
            User.username == update_data["username"],
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya está en uso"
            )
    
    # Actualizar los campos
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/reset-passwords")
def reset_all_passwords(db: Session = Depends(get_db)):
    """Endpoint temporal para resetear todas las contraseñas a 'password123'"""
    users = db.query(User).all()
    new_password = "password123"
    hashed_password = get_password_hash(new_password)
    
    for user in users:
        user.hashed_password = hashed_password
        db.add(user)
    
    db.commit()
    
    return {
        "message": f"Contraseñas reseteadas para {len(users)} usuarios",
        "new_password": new_password,
        "users_updated": [{"id": u.id, "email": u.email, "username": u.username} for u in users]
    }
