#!/bin/bash

echo "🔧 Configuración de Gmail para Secretaria AngLon"
echo "================================================"
echo ""

# Verificar si existe el archivo .env
if [ ! -f "backend/.env" ]; then
    echo "📝 Creando archivo .env desde .env.example..."
    cp env.example backend/.env
    echo "✅ Archivo .env creado"
    echo ""
    echo "⚠️  IMPORTANTE: Edita el archivo backend/.env con tus credenciales de Gmail"
    echo ""
fi

# Instalar dependencias adicionales si es necesario
echo "📦 Verificando dependencias..."
cd backend
pip install python-dotenv fastapi-mail aiosmtplib
echo "✅ Dependencias instaladas"
echo ""

echo "📋 Próximos pasos:"
echo "1. Crea una cuenta de Gmail"
echo "2. Habilita verificación en 2 pasos"
echo "3. Genera una contraseña de aplicación"
echo "4. Edita backend/.env con tus credenciales"
echo "5. Ejecuta: python backend/test_email.py"
echo ""
echo "📖 Para más detalles, lee: CONFIGURACION_GMAIL.md"
