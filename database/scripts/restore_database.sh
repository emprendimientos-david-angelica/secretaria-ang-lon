#!/bin/bash

# Script de restauración de base de datos
# Compatible con PostgreSQL

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Iniciando restauración de base de datos...${NC}"

# Verificar variables de entorno
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL no está configurada${NC}"
    exit 1
fi

# Verificar argumentos
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: Debes especificar el archivo de backup${NC}"
    echo "Uso: $0 <archivo_backup.sql>"
    echo "Ejemplo: $0 backups/secretaria_backup_20240101_120000.sql"
    exit 1
fi

BACKUP_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: El archivo de backup no existe: $BACKUP_FILE${NC}"
    exit 1
fi

# Función para confirmar restauración
confirm_restore() {
    echo -e "${YELLOW}⚠️  ADVERTENCIA: Esta operación reemplazará todos los datos actuales${NC}"
    echo -e "${YELLOW}📊 Base de datos destino: $DATABASE_URL${NC}"
    echo -e "${YELLOW}📁 Archivo de backup: $BACKUP_FILE${NC}"
    echo ""
    read -p "¿Estás seguro de que quieres continuar? (escribe 'SI' para confirmar): " confirmation
    
    if [ "$confirmation" != "SI" ]; then
        echo -e "${YELLOW}❌ Operación cancelada${NC}"
        exit 0
    fi
}

# Función para restaurar base de datos
restore_database() {
    echo -e "${YELLOW}🔄 Restaurando base de datos...${NC}"
    
    if command -v psql &> /dev/null; then
        psql "$DATABASE_URL" < "$BACKUP_FILE"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Base de datos restaurada exitosamente${NC}"
        else
            echo -e "${RED}❌ Error restaurando base de datos${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ psql no está instalado. Instala PostgreSQL client tools${NC}"
        exit 1
    fi
}

# Función para verificar restauración
verify_restore() {
    echo -e "${YELLOW}🔍 Verificando restauración...${NC}"
    
    if command -v psql &> /dev/null; then
        psql "$DATABASE_URL" -c "
            SELECT 
                schemaname,
                tablename,
                n_tup_ins as inserts,
                n_tup_upd as updates,
                n_tup_del as deletes
            FROM pg_stat_user_tables 
            ORDER BY tablename;
        "
    fi
}

# Función principal
main() {
    echo -e "${GREEN}🎯 Restauración de base de datos para La Secretaria de AngLon${NC}"
    echo ""
    
    # Confirmar operación
    confirm_restore
    
    # Restaurar base de datos
    restore_database
    
    # Verificar restauración
    verify_restore
    
    echo -e "${GREEN}✅ Proceso de restauración completado${NC}"
    echo -e "${YELLOW}📋 Próximos pasos:${NC}"
    echo "1. Verifica que la aplicación funcione correctamente"
    echo "2. Revisa los datos restaurados"
    echo "3. Actualiza la configuración si es necesario"
}

# Ejecutar función principal
main

