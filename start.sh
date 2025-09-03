#!/bin/bash

echo "🚀 Iniciando La Secretaria de AngLon..."

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor, instala Docker Compose primero."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde env.example..."
    cp env.example .env
    echo "✅ Archivo .env creado. Por favor, revisa y edita las variables según sea necesario."
fi

# Construir y levantar los contenedores
echo "🔨 Construyendo y levantando los contenedores..."
docker-compose up -d --build

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar el estado de los servicios
echo "🔍 Verificando el estado de los servicios..."
docker-compose ps

echo ""
echo "🎉 ¡La Secretaria de AngLon está lista!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 Documentación API: http://localhost:8000/docs"
echo ""
echo "💡 Para ver los logs: docker-compose logs -f"
echo "🛑 Para detener: docker-compose down"
echo ""
echo "¡Disfruta de tu secretaria personal digital! 💕"
