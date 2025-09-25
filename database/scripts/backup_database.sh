#!/bin/bash

# Script de backup de base de datos
# Compatible con PostgreSQL

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="secretaria_backup_${TIMESTAMP}.sql"

echo -e "${GREEN}💾 Iniciando backup de base de datos...${NC}"

# Verificar variables de entorno
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL no está configurada${NC}"
    exit 1
fi

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Función para hacer backup
backup_database() {
    echo -e "${YELLOW}📦 Creando backup: $BACKUP_FILE${NC}"
    
    if command -v pg_dump &> /dev/null; then
        pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_FILE"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Backup creado exitosamente${NC}"
            echo -e "${YELLOW}📁 Ubicación: $BACKUP_DIR/$BACKUP_FILE${NC}"
            
            # Mostrar tamaño del archivo
            if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
                SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
                echo -e "${YELLOW}📊 Tamaño: $SIZE${NC}"
            fi
        else
            echo -e "${RED}❌ Error creando backup${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ pg_dump no está instalado. Instala PostgreSQL client tools${NC}"
        exit 1
    fi
}

# Función para limpiar backups antiguos
cleanup_old_backups() {
    echo -e "${YELLOW}🧹 Limpiando backups antiguos (más de 7 días)...${NC}"
    
    find "$BACKUP_DIR" -name "secretaria_backup_*.sql" -mtime +7 -delete
    
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

# Función principal
main() {
    echo -e "${GREEN}🎯 Backup de base de datos para La Secretaria de AngLon${NC}"
    echo -e "${YELLOW}📊 URL de base de datos: $DATABASE_URL${NC}"
    echo ""
    
    # Crear backup
    backup_database
    
    # Limpiar backups antiguos
    cleanup_old_backups
    
    echo -e "${GREEN}✅ Proceso de backup completado${NC}"
}

# Ejecutar función principal
main

