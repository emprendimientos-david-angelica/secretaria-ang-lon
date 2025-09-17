from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date

# Schemas de Usuario
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Schemas de Tarea
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = "medium"

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None
    priority: Optional[str] = None

class Task(TaskBase):
    id: int
    is_completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner_id: int

    class Config:
        from_attributes = True

# Schemas de Evento
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: datetime
    location: Optional[str] = None
    is_all_day: bool = False

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[datetime] = None
    location: Optional[str] = None
    is_all_day: Optional[bool] = None

class Event(EventBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner_id: int

    class Config:
        from_attributes = True

# Schemas de Autenticación
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str
