from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import random
import string
from database import get_db
from models import User, PasswordResetCode
from schemas import UserCreate, UserLogin, Token, User as UserSchema, UserUpdate, PasswordResetRequest, PasswordResetVerify
from auth import verify_password, get_password_hash, create_access_token
from config import settings
from dependencies import get_current_user
from email_config import send_password_reset_email

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
    # Buscar usuario por email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )
    
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

def generate_reset_code():
    """Genera un código de 6 dígitos para recuperación de contraseña"""
    return ''.join(random.choices(string.digits, k=6))

@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Solicita un código de recuperación de contraseña por email"""
    
    # Verificar si el usuario existe
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Por seguridad, no revelamos si el email existe o no
        return {"message": "Si el email existe, se enviará un código de recuperación"}
    
    # Generar código de 6 dígitos
    code = generate_reset_code()
    
    # Calcular tiempo de expiración (15 minutos)
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    
    # Invalidar códigos anteriores para este email
    db.query(PasswordResetCode).filter(
        PasswordResetCode.email == request.email
    ).update({"is_used": True})
    
    # Crear nuevo código
    reset_code = PasswordResetCode(
        email=request.email,
        code=code,
        expires_at=expires_at
    )
    
    db.add(reset_code)
    db.commit()
    
    # Enviar email
    email_sent = await send_password_reset_email(request.email, code)
    
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al enviar el email. Intenta nuevamente."
        )
    
    return {"message": "Si el email existe, se enviará un código de recuperación"}

@router.post("/reset-password")
def reset_password(request: PasswordResetVerify, db: Session = Depends(get_db)):
    """Verifica el código y actualiza la contraseña"""
    
    # Buscar el código válido
    reset_code = db.query(PasswordResetCode).filter(
        PasswordResetCode.email == request.email,
        PasswordResetCode.code == request.code,
        PasswordResetCode.is_used == False,
        PasswordResetCode.expires_at > datetime.utcnow()
    ).first()
    
    if not reset_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código inválido o expirado"
        )
    
    # Buscar el usuario
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Actualizar contraseña
    user.hashed_password = get_password_hash(request.new_password)
    
    # Marcar código como usado
    reset_code.is_used = True
    
    db.add(user)
    db.add(reset_code)
    db.commit()
    
    return {"message": "Contraseña actualizada exitosamente"}

