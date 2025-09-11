from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    is_active: bool = True
    is_admin: bool = False

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PasswordChange(BaseModel):
    new_password: str

class SystemLogBase(BaseModel):
    level: str
    message: str
    action: Optional[str] = None
    user_id: Optional[int] = None

class SystemLog(SystemLogBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

class SystemStats(BaseModel):
    total_users: int
    active_users: int
    admin_users: int
    total_tasks: int
    total_events: int
    system_uptime: str
