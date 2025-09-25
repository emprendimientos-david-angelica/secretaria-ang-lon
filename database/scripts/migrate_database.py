#!/usr/bin/env python3
"""
Script de migración de base de datos usando Alembic
"""

import sys
import os
import subprocess
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_alembic_command(command):
    """Ejecutar comando de Alembic"""
    try:
        # Cambiar al directorio database
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # Ejecutar comando
        result = subprocess.run(
            ["alembic"] + command.split(),
            capture_output=True,
            text=True,
            check=True
        )
        
        logger.info(f"Comando ejecutado: alembic {' '.join(command.split())}")
        if result.stdout:
            logger.info(f"Output: {result.stdout}")
        
        return True
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Error ejecutando comando: {e}")
        logger.error(f"Stderr: {e.stderr}")
        return False
    except FileNotFoundError:
        logger.error("Alembic no está instalado. Instala con: pip install alembic")
        return False

def create_migration(message):
    """Crear nueva migración"""
    logger.info(f"Creando migración: {message}")
    return run_alembic_command(f"revision --autogenerate -m '{message}'")

def upgrade_database():
    """Aplicar migraciones pendientes"""
    logger.info("Aplicando migraciones...")
    return run_alembic_command("upgrade head")

def downgrade_database(revision="base"):
    """Revertir migraciones"""
    logger.info(f"Revirtiendo a: {revision}")
    return run_alembic_command(f"downgrade {revision}")

def show_migration_history():
    """Mostrar historial de migraciones"""
    logger.info("Mostrando historial de migraciones...")
    return run_alembic_command("history")

def show_current_revision():
    """Mostrar revisión actual"""
    logger.info("Mostrando revisión actual...")
    return run_alembic_command("current")

def main():
    """Función principal"""
    if len(sys.argv) < 2:
        print("Uso: python migrate_database.py <comando> [argumentos]")
        print("Comandos disponibles:")
        print("  create <mensaje>     - Crear nueva migración")
        print("  upgrade             - Aplicar migraciones pendientes")
        print("  downgrade [rev]     - Revertir migraciones")
        print("  history             - Mostrar historial")
        print("  current             - Mostrar revisión actual")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "create":
        if len(sys.argv) < 3:
            logger.error("Debes especificar un mensaje para la migración")
            sys.exit(1)
        message = " ".join(sys.argv[2:])
        success = create_migration(message)
        
    elif command == "upgrade":
        success = upgrade_database()
        
    elif command == "downgrade":
        revision = sys.argv[2] if len(sys.argv) > 2 else "base"
        success = downgrade_database(revision)
        
    elif command == "history":
        success = show_migration_history()
        
    elif command == "current":
        success = show_current_revision()
        
    else:
        logger.error(f"Comando no reconocido: {command}")
        sys.exit(1)
    
    if success:
        logger.info("✅ Operación completada exitosamente")
    else:
        logger.error("❌ Error en la operación")
        sys.exit(1)

if __name__ == "__main__":
    main()

