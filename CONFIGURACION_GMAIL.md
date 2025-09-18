# 📧 Configuración de Gmail para Envío de Correos

## Pasos para configurar Gmail correctamente

### 1. Crear cuenta de Gmail
- Ve a [Gmail.com](https://gmail.com)
- Crea una cuenta profesional como `secretaria.anglon@gmail.com`
- Esta será la cuenta que envíe todos los correos del sistema

### 2. Habilitar verificación en 2 pasos
- Ve a tu cuenta de Google → **Seguridad**
- Busca **"Verificación en 2 pasos"** y actívala
- ⚠️ **OBLIGATORIO**: Sin esto no podrás usar contraseñas de aplicación

### 3. Generar contraseña de aplicación
- En la sección de Seguridad, busca **"Contraseñas de aplicación"**
- Selecciona **"Correo"** como aplicación
- Selecciona **"Otro"** como dispositivo
- Ponle un nombre como "Secretaria AngLon"
- Google te dará una contraseña de **16 caracteres** (guárdala bien)

### 4. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `backend/` con:

```env
# Configuración de Email
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-contraseña-de-aplicacion-16-caracteres
MAIL_FROM=tu-email@gmail.com
```

### 5. Probar la configuración

Una vez configurado, puedes probar el envío de correos:

1. Inicia el servidor backend
2. Ve al frontend y prueba "Olvidé mi contraseña"
3. Ingresa un email válido
4. Revisa la bandeja de entrada (y spam)

## ⚠️ Importante

- **NUNCA** uses tu contraseña normal de Gmail
- **SIEMPRE** usa la contraseña de aplicación de 16 caracteres
- La verificación en 2 pasos es **obligatoria**
- Los correos pueden llegar a la carpeta de spam inicialmente

## 🔧 Configuración actual del sistema

El sistema ya está configurado para:
- ✅ Enviar códigos de 6 dígitos
- ✅ Códigos expiran en 15 minutos
- ✅ Template HTML profesional
- ✅ Manejo de errores
- ✅ Integración con FastAPI

Solo necesitas configurar las credenciales de Gmail.
