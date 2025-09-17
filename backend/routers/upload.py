from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import uuid
from datetime import datetime
from PIL import Image
import shutil

from database import get_db
from models import User
from dependencies import get_current_user
from config import settings

router = APIRouter()

# Configuración de archivos permitidos
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def is_allowed_file(filename: str) -> bool:
    """Verificar si la extensión del archivo está permitida"""
    return any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS)

def generate_unique_filename(original_filename: str) -> str:
    """Generar un nombre único para el archivo"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    _, ext = os.path.splitext(original_filename)
    return f"{timestamp}_{unique_id}{ext}"

def resize_image(image_path: str, max_size: tuple = (400, 400)) -> str:
    """Redimensionar imagen manteniendo proporciones"""
    try:
        with Image.open(image_path) as img:
            # Convertir a RGB si es necesario
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            # Redimensionar manteniendo proporciones
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Guardar la imagen redimensionada
            img.save(image_path, "JPEG", quality=85, optimize=True)
            
        return image_path
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al procesar la imagen: {str(e)}"
        )

@router.post("/profile-photo")
async def upload_profile_photo(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    file: UploadFile = File(...)
):
    """Subir foto de perfil del usuario"""
    
    print("DEBUG: Función upload_profile_photo llamada")
    print(f"DEBUG: Archivo recibido - filename: {file.filename}, content_type: {file.content_type}")
    print(f"DEBUG: Usuario actual: {current_user.username}")
    
    # Verificar que el archivo no esté vacío
    if not file.filename:
        print("DEBUG: Error - No filename")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se ha seleccionado ningún archivo"
        )
    
    # Verificar extensión del archivo
    print(f"DEBUG: Verificando extensión - filename: {file.filename}")
    if not is_allowed_file(file.filename):
        print(f"DEBUG: Error - Extensión no permitida: {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido. Extensiones permitidas: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Verificar tamaño del archivo
    file_content = await file.read()
    print(f"DEBUG: Tamaño del archivo: {len(file_content)} bytes")
    if len(file_content) > MAX_FILE_SIZE:
        print(f"DEBUG: Error - Archivo demasiado grande: {len(file_content)} > {MAX_FILE_SIZE}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El archivo es demasiado grande. Tamaño máximo: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Generar nombre único para el archivo
    unique_filename = generate_unique_filename(file.filename)
    file_path = os.path.join("uploads", "profile_photos", unique_filename)
    
    try:
        # Asegurar que el directorio existe
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Guardar el archivo
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Redimensionar la imagen
        resize_image(file_path)
        
        # Actualizar la URL de la foto en la base de datos
        photo_url = f"/api/upload/profile-photo/{unique_filename}"
        current_user.photo_url = photo_url
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        
        return {
            "message": "Foto de perfil subida exitosamente",
            "photo_url": photo_url,
            "filename": unique_filename
        }
        
    except Exception as e:
        # Limpiar archivo si hay error
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir la foto: {str(e)}"
        )

@router.get("/profile-photo/{filename}")
async def get_profile_photo(filename: str):
    """Obtener foto de perfil por nombre de archivo"""
    file_path = os.path.join("uploads", "profile_photos", filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Foto no encontrada"
        )
    
    return FileResponse(
        file_path,
        media_type="image/jpeg",
        filename=filename
    )

@router.delete("/profile-photo")
async def delete_profile_photo(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Eliminar foto de perfil del usuario"""
    
    if not current_user.photo_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay foto de perfil para eliminar"
        )
    
    try:
        # Extraer nombre del archivo de la URL
        filename = current_user.photo_url.split("/")[-1]
        file_path = os.path.join("uploads", "profile_photos", filename)
        
        # Eliminar archivo del sistema de archivos
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Limpiar URL de la base de datos
        current_user.photo_url = None
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        
        return {"message": "Foto de perfil eliminada exitosamente"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar la foto: {str(e)}"
        )
