#!/usr/bin/env python3
"""
Script para probar la funcionalidad completa de recuperación de contraseñas
Simula exactamente lo que hace el frontend
"""

import asyncio
import requests
import json
import os
from email_config import send_password_reset_email

async def test_password_recovery_flow():
    """Prueba el flujo completo de recuperación de contraseñas"""
    
    print("🔧 Test de Recuperación de Contraseñas - Secretaria AngLon")
    print("=" * 60)
    print()
    
    # Configuración
    base_url = "http://localhost:8000"
    test_email = "admin@secretaria.com"  # Usuario que sabemos que existe
    
    print(f"📧 Email de prueba: {test_email}")
    print(f"🌐 URL del backend: {base_url}")
    print()
    
    # Paso 1: Solicitar recuperación de contraseña
    print("🔄 Paso 1: Solicitando recuperación de contraseña...")
    print("-" * 50)
    
    try:
        response = requests.post(
            f"{base_url}/api/auth/forgot-password",
            json={"email": test_email},
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📊 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Solicitud de recuperación enviada exitosamente")
        else:
            print(f"❌ Error en la solicitud: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error conectando al backend: {e}")
        print("💡 Asegúrate de que el backend esté ejecutándose en http://localhost:8000")
        return False
    
    print()
    
    # Paso 2: Verificar que el correo se envió
    print("📧 Paso 2: Verificando envío de correo...")
    print("-" * 50)
    print(f"📬 Revisa tu email: {test_email}")
    print("📁 También revisa la carpeta de spam")
    print()
    
    # Paso 3: Simular verificación de código (opcional)
    print("🔢 Paso 3: Para completar la prueba...")
    print("-" * 50)
    print("1. Revisa tu email y copia el código de 6 dígitos")
    print("2. Usa ese código en el frontend para restablecer la contraseña")
    print("3. O puedes probar manualmente con:")
    print(f"   POST {base_url}/api/auth/reset-password")
    print("   Body: {\"email\": \"" + test_email + "\", \"code\": \"123456\", \"new_password\": \"nueva_contraseña\"}")
    print()
    
    return True

async def test_direct_email_sending():
    """Prueba el envío directo de correos (bypass del endpoint)"""
    
    print("🧪 Test Directo de Envío de Correos")
    print("=" * 40)
    print()
    
    test_email = "admin@secretaria.com"
    test_code = "123456"
    
    print(f"📧 Enviando correo directo a: {test_email}")
    print(f"🔢 Con código: {test_code}")
    print()
    
    try:
        success = await send_password_reset_email(test_email, test_code)
        
        if success:
            print("✅ Correo enviado exitosamente")
            print(f"📬 Revisa: {test_email}")
        else:
            print("❌ Error al enviar correo")
            
        return success
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def main():
    print("🚀 Iniciando pruebas de recuperación de contraseñas...")
    print()
    
    # Test 1: Flujo completo via API
    print("🧪 PRUEBA 1: Flujo completo via API")
    print("=" * 50)
    api_success = await test_password_recovery_flow()
    print()
    
    # Test 2: Envío directo de correos
    print("🧪 PRUEBA 2: Envío directo de correos")
    print("=" * 50)
    direct_success = await test_direct_email_sending()
    print()
    
    # Resumen
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 30)
    print(f"API Endpoint: {'✅' if api_success else '❌'}")
    print(f"Envío Directo: {'✅' if direct_success else '❌'}")
    print()
    
    if api_success and direct_success:
        print("🎉 Todas las pruebas pasaron!")
        print("💡 Si no recibes correos, revisa:")
        print("   - Carpeta de spam")
        print("   - Configuración de Gmail")
        print("   - Logs del backend")
    else:
        print("❌ Hay problemas que necesitan resolverse")
        print("💡 Revisa los logs del backend para más detalles")

if __name__ == "__main__":
    asyncio.run(main())
