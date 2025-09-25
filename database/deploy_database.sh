#!/bin/bash

# Script de despliegue de base de datos para la nube
# Compatible con AWS RDS, Google Cloud SQL, Azure Database

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando despliegue de base de datos...${NC}"

# Verificar variables de entorno
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL no está configurada${NC}"
    echo "Configura la variable de entorno DATABASE_URL con la URL de tu base de datos en la nube"
    echo "Ejemplo: export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

# Función para ejecutar SQL
execute_sql() {
    local sql_file=$1
    echo -e "${YELLOW}📄 Ejecutando: $sql_file${NC}"
    
    if command -v psql &> /dev/null; then
        psql "$DATABASE_URL" -f "$sql_file"
    else
        echo -e "${RED}❌ psql no está instalado. Instala PostgreSQL client tools${NC}"
        exit 1
    fi
}

# Función para verificar conexión
check_connection() {
    echo -e "${YELLOW}🔍 Verificando conexión a la base de datos...${NC}"
    
    if command -v psql &> /dev/null; then
        psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Conexión exitosa${NC}"
        else
            echo -e "${RED}❌ No se pudo conectar a la base de datos${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  psql no disponible, saltando verificación de conexión${NC}"
    fi
}

# Función para crear base de datos
create_database() {
    echo -e "${YELLOW}🏗️  Creando estructura de base de datos...${NC}"
    
    # Ejecutar script SQL
    if [ -f "database/schema.sql" ]; then
        execute_sql "database/schema.sql"
    else
        echo -e "${RED}❌ No se encontró database/schema.sql${NC}"
        exit 1
    fi
}

# Función para verificar tablas
verify_tables() {
    echo -e "${YELLOW}🔍 Verificando tablas creadas...${NC}"
    
    if command -v psql &> /dev/null; then
        psql "$DATABASE_URL" -c "
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        "
    fi
}

# Función principal
main() {
    echo -e "${GREEN}🎯 Configuración de base de datos para La Secretaria de AngLon${NC}"
    echo -e "${YELLOW}📊 URL de base de datos: $DATABASE_URL${NC}"
    echo ""
    
    # Verificar conexión
    check_connection
    
    # Crear base de datos
    create_database
    
    # Verificar tablas
    verify_tables
    
    echo -e "${GREEN}✅ Base de datos desplegada exitosamente${NC}"
    echo -e "${YELLOW}📋 Próximos pasos:${NC}"
    echo "1. Actualiza tu archivo .env con la nueva DATABASE_URL"
    echo "2. Reinicia tu aplicación backend"
    echo "3. Verifica que la aplicación funcione correctamente"
}

# Ejecutar función principal
main

