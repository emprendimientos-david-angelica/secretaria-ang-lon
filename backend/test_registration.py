#!/usr/bin/env python3
"""
Script para probar el registro de usuarios sin nombre de usuario
"""

import requests
import json

def test_user_registration():
    """Prueba el registro de usuarios sin nombre de usuario"""
    
    print("🧪 Test de Registro de Usuarios - Secretaria AngLon")
    print("=" * 60)
    print()
    
    base_url = "http://localhost:8000"
    
    # Datos de prueba para registro
    test_users = [
        {
            "email": "test1@secretaria.com",
            "full_name": "Usuario de Prueba 1",
            "phone_number": "+573001234567",
            "password": "password123"
        },
        {
            "email": "test2@secretaria.com", 
            "full_name": "Usuario de Prueba 2",
            "password": "password123"
            # Sin phone_number para probar campo opcional
        },
        {
            "email": "test3@secretaria.com",
            "password": "password123"
            # Solo email y password (mínimo requerido)
        }
    ]
    
    for i, user_data in enumerate(test_users, 1):
        print(f"🔄 Prueba {i}: Registrando usuario...")
        print(f"   Email: {user_data['email']}")
        print(f"   Nombre: {user_data.get('full_name', 'No especificado')}")
        print(f"   Teléfono: {user_data.get('phone_number', 'No especificado')}")
        print()
        
        try:
            response = requests.post(
                f"{base_url}/api/auth/register",
                json=user_data,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"📊 Status Code: {response.status_code}")
            print(f"📊 Response: {response.text}")
            
            if response.status_code == 200:
                print("✅ Usuario registrado exitosamente")
                user_info = response.json()
                print(f"   ID: {user_info.get('id')}")
                print(f"   Email: {user_info.get('email')}")
                print(f"   Username: {user_info.get('username', 'No especificado')}")
                print(f"   Nombre: {user_info.get('full_name', 'No especificado')}")
            else:
                print(f"❌ Error en el registro: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error conectando al backend: {e}")
        
        print("-" * 50)
        print()
    
    # Prueba de login con email
    print("🔐 Prueba de Login con Email...")
    print("-" * 30)
    
    login_data = {
        "email": "test1@secretaria.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📊 Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login exitoso con email")
            token_info = response.json()
            print(f"   Token: {token_info.get('access_token', 'No disponible')[:20]}...")
        else:
            print(f"❌ Error en el login: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error en login: {e}")
    
    print()
    print("🎉 Pruebas completadas!")

if __name__ == "__main__":
    test_user_registration()
