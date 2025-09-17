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

# Configuración
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
UPLOAD_DIR = os.path.join("uploads", "profile_photos")

# --- Funciones de Utilidad ---

def is_allowed_file(filename: str) -> bool:
    """Verifica si la extensión del archivo está permitida."""
    return any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS)

def generate_unique_filename(original_filename: str) -> str:
    """Genera un nombre de archivo único para evitar colisiones."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    _, ext = os.path.splitext(original_filename)
    return f"{timestamp}_{unique_id}{ext}"

def resize_image(image_path: str, max_size: tuple = (400, 400)) -> str:
    """Redimensiona una imagen a un tamaño máximo manteniendo la proporción."""
    try:
        with Image.open(image_path) as img:
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            img.save(image_path, "JPEG", quality=85, optimize=True)
            
        return image_path
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al procesar la imagen: {str(e)}"
        )

# --- Endpoints ---

@router.post("/profile-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sube y procesa la foto de perfil de un usuario."""
    
    # Validaciones
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se ha seleccionado ningún archivo.")
    
    if not is_allowed_file(file.filename):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Tipo de archivo no permitido. Solo se aceptan: {', '.join(ALLOWED_EXTENSIONS)}")
    
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"El archivo es demasiado grande. Tamaño máximo: {MAX_FILE_SIZE // (1024*1024)}MB.")
    
    # Preparación de archivo
    unique_filename = generate_unique_filename(file.filename)
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Guardar archivo
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Procesar imagen
        resize_image(file_path)
        
        # Actualizar base de datos
        photo_url = f"/api/upload/profile-photo/{unique_filename}"
        current_user.photo_url = photo_url
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        
        return {
            "message": "Foto de perfil subida exitosamente.",
            "photo_url": photo_url,
            "filename": unique_filename
        }
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error interno al subir la foto: {str(e)}")

@router.get("/profile-photo/{filename}")
async def get_profile_photo(filename: str):
    """Sirve un archivo de foto de perfil."""
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Foto no encontrada.")
    
    return FileResponse(file_path, media_type="image/jpeg", filename=filename)

@router.delete("/profile-photo")
async def delete_profile_photo(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Elimina la foto de perfil del usuario actual."""
    
    if not current_user.photo_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No hay foto de perfil para eliminar.")
    
    try:
        filename = current_user.photo_url.split("/")[-1]
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        if os.path.exists(file_path):
            os.remove(file_path)
        
        current_user.photo_url = None
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        
        return {"message": "Foto de perfil eliminada exitosamente."}
        
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error al eliminar la foto: {str(e)}")
