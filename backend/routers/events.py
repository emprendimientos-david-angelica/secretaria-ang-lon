from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Event
from schemas import EventCreate, EventUpdate, Event as EventSchema
from dependencies import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[EventSchema])
def get_events(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene todos los eventos del usuario actual"""
    events = db.query(Event).filter(Event.owner_id == current_user.id).all()
    return events

@router.post("/", response_model=EventSchema)
def create_event(
    event: EventCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Crea un nuevo evento"""
    db_event = Event(**event.dict(), owner_id=current_user.id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/{event_id}", response_model=EventSchema)
def get_event(
    event_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtiene un evento específico"""
    event = db.query(Event).filter(
        Event.id == event_id,
        Event.owner_id == current_user.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    return event

@router.put("/{event_id}", response_model=EventSchema)
def update_event(
    event_id: int,
    event_update: EventUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualiza un evento existente"""
    db_event = db.query(Event).filter(
        Event.id == event_id,
        Event.owner_id == current_user.id
    ).first()
    
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    # Actualizar solo los campos proporcionados
    update_data = event_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_event, field, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Elimina un evento"""
    db_event = db.query(Event).filter(
        Event.id == event_id,
        Event.owner_id == current_user.id
    ).first()
    
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento no encontrado"
        )
    
    db.delete(db_event)
    db.commit()
    
    return {"message": "Evento eliminado exitosamente"}
