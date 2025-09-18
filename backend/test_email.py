#!/usr/bin/env python3
"""
Script para probar el envío de correos de recuperación de contraseña
Uso: python test_email.py
"""

import asyncio
import os
from email_config import send_password_reset_email

async def test_email_sending():
    """Prueba el envío de correos"""
    
    print("🧪 Probando envío de correos de recuperación...")
    print("=" * 50)
    
    # Verificar variables de entorno
    mail_username = os.getenv("MAIL_USERNAME")
    mail_password = os.getenv("MAIL_PASSWORD")
    mail_from = os.getenv("MAIL_FROM")
    
    print(f"📧 Usuario de correo: {mail_username}")
    print(f"📧 Correo remitente: {mail_from}")
    print(f"🔑 Contraseña configurada: {'✅ Sí' if mail_password else '❌ No'}")
    print()
    
    if not all([mail_username, mail_password, mail_from]):
        print("❌ ERROR: Faltan variables de entorno")
        print("Asegúrate de tener configurado:")
        print("- MAIL_USERNAME")
        print("- MAIL_PASSWORD") 
        print("- MAIL_FROM")
        return False
    
    # Email de prueba (puedes cambiarlo aquí)
    test_email = "davidorlandotimana@gmail.com"  # Cambia este email por el tuyo
    
    print(f"📧 Email de prueba: {test_email}")
    
    if not test_email:
        print("❌ No se configuró email de prueba")
        return False
    
    # Generar código de prueba
    test_code = "123456"
    
    print(f"📤 Enviando correo de prueba a: {test_email}")
    print(f"🔢 Código de prueba: {test_code}")
    print()
    
    try:
        # Enviar correo
        success = await send_password_reset_email(test_email, test_code)
        
        if success:
            print("✅ ¡Correo enviado exitosamente!")
            print(f"📬 Revisa la bandeja de entrada de: {test_email}")
            print("📁 También revisa la carpeta de spam si no lo encuentras")
            return True
        else:
            print("❌ Error al enviar el correo")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Test de Configuración de Gmail - Secretaria AngLon")
    print("=" * 60)
    print()
    
    # Cargar variables de entorno
    from dotenv import load_dotenv
    load_dotenv()
    
    # Ejecutar prueba
    result = asyncio.run(test_email_sending())
    
    print()
    print("=" * 50)
    if result:
        print("🎉 ¡Configuración de Gmail exitosa!")
        print("Ya puedes usar el sistema de recuperación de contraseñas")
    else:
        print("❌ Configuración incompleta")
        print("Revisa los pasos en CONFIGURACION_GMAIL.md")