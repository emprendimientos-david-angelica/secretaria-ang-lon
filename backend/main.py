from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import uvicorn

from database import engine, get_db
from models import Base
from routers import auth, tasks, events
from config import settings

# Crear tablas de la base de datos
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear tablas al iniciar
    Base.metadata.create_all(bind=engine)
    yield

# Crear aplicación FastAPI
app = FastAPI(
    title="La Secretaria de AngLon API",
    description="API para la aplicación de secretaria personal digital",
    version="1.0.0",
    lifespan=lifespan
)

# Configurar CORS para permitir acceso desde la red local
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://192.168.1.6:3000",
        "http://192.168.1.*:3000",  # Cualquier IP en la red 192.168.1.x
        "http://0.0.0.0:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(events.router, prefix="/api/events", tags=["events"])

@app.get("/")
async def root():
    return {
        "message": "Bienvenido a La Secretaria de AngLon API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "secretaria-anglon-api"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True
    )
