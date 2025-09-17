from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from config import settings
import os

# Configuración de email
email_config = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "your-email@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "your-app-password"),
    MAIL_FROM=os.getenv("MAIL_FROM", "your-email@gmail.com"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

fastmail = FastMail(email_config)

async def send_password_reset_email(email: str, code: str):
    """Envía un email con el código de recuperación de contraseña"""
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Recuperación de Contraseña - Secretaria AngLon</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .code {{
                background: #667eea;
                color: white;
                font-size: 24px;
                font-weight: bold;
                padding: 15px 30px;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
                letter-spacing: 3px;
            }}
            .warning {{
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔐 Recuperación de Contraseña</h1>
            <p>Secretaria AngLon</p>
        </div>
        
        <div class="content">
            <h2>Hola,</h2>
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Secretaria AngLon.</p>
            
            <p>Utiliza el siguiente código para continuar con el proceso:</p>
            
            <div class="code">{code}</div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                    <li>Este código expira en 15 minutos</li>
                    <li>No compartas este código con nadie</li>
                    <li>Si no solicitaste este cambio, ignora este email</li>
                </ul>
            </div>
            
            <p>Si tienes problemas, contacta a nuestro equipo de soporte.</p>
            
            <p>¡Gracias por usar Secretaria AngLon!</p>
        </div>
        
        <div class="footer">
            <p>Este es un email automático, por favor no respondas.</p>
            <p>© 2024 Secretaria AngLon - Tu asistente digital de confianza</p>
        </div>
    </body>
    </html>
    """
    
    message = MessageSchema(
        subject="🔐 Código de Recuperación de Contraseña - Secretaria AngLon",
        recipients=[email],
        body=html_content,
        subtype="html"
    )
    
    try:
        await fastmail.send_message(message)
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False
