from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Task
from schemas import TaskCreate, TaskUpdate, Task as TaskSchema
from dependencies import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[TaskSchema])
def get_tasks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene todas las tareas del usuario actual"""
    tasks = db.query(Task).filter(Task.owner_id == current_user.id).all()
    return tasks

@router.post("/", response_model=TaskSchema)
def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crea una nueva tarea"""
    db_task = Task(**task.dict(), owner_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/{task_id}", response_model=TaskSchema)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene una tarea específica"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada"
        )
    
    return task

@router.put("/{task_id}", response_model=TaskSchema)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualiza una tarea existente"""
    db_task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()
    
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada"
        )
    
    # Actualizar solo los campos proporcionados
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Elimina una tarea"""
    db_task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()
    
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada"
        )
    
    db.delete(db_task)
    db.commit()
    
    return {"message": "Tarea eliminada exitosamente"}

@router.patch("/{task_id}/toggle", response_model=TaskSchema)
def toggle_task_completion(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Cambia el estado de completado de una tarea"""
    db_task = db.query(Task).filter(
        Task.id == task_id,
        Task.owner_id == current_user.id
    ).first()
    
    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada"
        )
    
    db_task.is_completed = not db_task.is_completed
    db.commit()
    db.refresh(db_task)
    
    return db_task
