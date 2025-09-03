#!/bin/bash

# 🌿 Git Workflow Helper - La Secretaria de AngLon
# Script para facilitar el flujo de trabajo con Git

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${CYAN}🌿 Git Workflow Helper - La Secretaria de AngLon${NC}"
    echo ""
    echo -e "${YELLOW}Uso:${NC} $0 [comando] [opciones]"
    echo ""
    echo -e "${YELLOW}Comandos disponibles:${NC}"
    echo -e "  ${GREEN}feature${NC} <nombre>     - Crear rama de feature desde develop"
    echo -e "  ${GREEN}bugfix${NC} <nombre>      - Crear rama de bugfix desde develop"
    echo -e "  ${GREEN}hotfix${NC} <nombre>      - Crear rama de hotfix desde main"
    echo -e "  ${GREEN}release${NC} <version>    - Crear rama de release desde develop"
    echo -e "  ${GREEN}finish${NC} <rama>        - Finalizar rama (merge y cleanup)"
    echo -e "  ${GREEN}status${NC}               - Mostrar estado de ramas"
    echo -e "  ${GREEN}sync${NC}                 - Sincronizar ramas con remoto"
    echo -e "  ${GREEN}help${NC}                 - Mostrar esta ayuda"
    echo ""
    echo -e "${YELLOW}Ejemplos:${NC}"
    echo -e "  $0 feature login-system"
    echo -e "  $0 bugfix api-timeout"
    echo -e "  $0 hotfix security-patch"
    echo -e "  $0 release v1.2.0"
    echo -e "  $0 finish feature/login-system"
}

# Función para verificar que estamos en un repositorio Git
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Error: No estás en un repositorio Git${NC}"
        exit 1
    fi
}

# Función para verificar que no hay cambios pendientes
check_clean_working_tree() {
    if ! git diff-index --quiet HEAD --; then
        echo -e "${RED}❌ Error: Tienes cambios pendientes. Haz commit o stash antes de continuar.${NC}"
        git status --short
        exit 1
    fi
}

# Función para crear rama de feature
create_feature() {
    local feature_name=$1
    if [ -z "$feature_name" ]; then
        echo -e "${RED}❌ Error: Debes especificar un nombre para la feature${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🌿 Creando rama de feature: feature/$feature_name${NC}"
    
    # Cambiar a develop y actualizar
    git checkout develop
    git pull origin develop
    
    # Crear rama de feature
    git checkout -b "feature/$feature_name"
    
    echo -e "${GREEN}✅ Rama feature/$feature_name creada desde develop${NC}"
    echo -e "${YELLOW}💡 Ahora puedes desarrollar tu funcionalidad${NC}"
}

# Función para crear rama de bugfix
create_bugfix() {
    local bugfix_name=$1
    if [ -z "$bugfix_name" ]; then
        echo -e "${RED}❌ Error: Debes especificar un nombre para el bugfix${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🐛 Creando rama de bugfix: bugfix/$bugfix_name${NC}"
    
    # Cambiar a develop y actualizar
    git checkout develop
    git pull origin develop
    
    # Crear rama de bugfix
    git checkout -b "bugfix/$bugfix_name"
    
    echo -e "${GREEN}✅ Rama bugfix/$bugfix_name creada desde develop${NC}"
    echo -e "${YELLOW}💡 Ahora puedes corregir el bug${NC}"
}

# Función para crear rama de hotfix
create_hotfix() {
    local hotfix_name=$1
    if [ -z "$hotfix_name" ]; then
        echo -e "${RED}❌ Error: Debes especificar un nombre para el hotfix${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🚨 Creando rama de hotfix: hotfix/$hotfix_name${NC}"
    
    # Cambiar a main y actualizar
    git checkout main
    git pull origin main
    
    # Crear rama de hotfix
    git checkout -b "hotfix/$hotfix_name"
    
    echo -e "${GREEN}✅ Rama hotfix/$hotfix_name creada desde main${NC}"
    echo -e "${YELLOW}💡 Ahora puedes corregir el error crítico${NC}"
}

# Función para crear rama de release
create_release() {
    local version=$1
    if [ -z "$version" ]; then
        echo -e "${RED}❌ Error: Debes especificar una versión para el release${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🚀 Creando rama de release: release/$version${NC}"
    
    # Cambiar a develop y actualizar
    git checkout develop
    git pull origin develop
    
    # Crear rama de release
    git checkout -b "release/$version"
    
    echo -e "${GREEN}✅ Rama release/$version creada desde develop${NC}"
    echo -e "${YELLOW}💡 Ahora puedes preparar el release${NC}"
}

# Función para finalizar rama
finish_branch() {
    local branch_name=$1
    if [ -z "$branch_name" ]; then
        echo -e "${RED}❌ Error: Debes especificar el nombre de la rama${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🏁 Finalizando rama: $branch_name${NC}"
    
    # Obtener el tipo de rama
    local branch_type=$(echo "$branch_name" | cut -d'/' -f1)
    
    case $branch_type in
        "feature")
            finish_feature "$branch_name"
            ;;
        "bugfix")
            finish_bugfix "$branch_name"
            ;;
        "hotfix")
            finish_hotfix "$branch_name"
            ;;
        "release")
            finish_release "$branch_name"
            ;;
        *)
            echo -e "${RED}❌ Error: Tipo de rama no reconocido: $branch_type${NC}"
            exit 1
            ;;
    esac
}

# Función para finalizar feature
finish_feature() {
    local branch_name=$1
    
    echo -e "${BLUE}🔄 Finalizando feature: $branch_name${NC}"
    
    # Cambiar a develop
    git checkout develop
    git pull origin develop
    
    # Merge de la feature
    git merge "$branch_name"
    
    # Push a develop
    git push origin develop
    
    # Eliminar rama local
    git branch -d "$branch_name"
    
    # Eliminar rama remota
    git push origin --delete "$branch_name"
    
    echo -e "${GREEN}✅ Feature $branch_name finalizada y mergeada en develop${NC}"
}

# Función para finalizar bugfix
finish_bugfix() {
    local branch_name=$1
    
    echo -e "${BLUE}🔄 Finalizando bugfix: $branch_name${NC}"
    
    # Cambiar a develop
    git checkout develop
    git pull origin develop
    
    # Merge del bugfix
    git merge "$branch_name"
    
    # Push a develop
    git push origin develop
    
    # Eliminar rama local
    git branch -d "$branch_name"
    
    # Eliminar rama remota
    git push origin --delete "$branch_name"
    
    echo -e "${GREEN}✅ Bugfix $branch_name finalizado y mergeado en develop${NC}"
}

# Función para finalizar hotfix
finish_hotfix() {
    local branch_name=$1
    
    echo -e "${BLUE}🔄 Finalizando hotfix: $branch_name${NC}"
    
    # Cambiar a main
    git checkout main
    git pull origin main
    
    # Merge del hotfix
    git merge "$branch_name"
    
    # Push a main
    git push origin main
    
    # Cambiar a develop
    git checkout develop
    git pull origin develop
    
    # Merge del hotfix en develop
    git merge "$branch_name"
    
    # Push a develop
    git push origin develop
    
    # Eliminar rama local
    git branch -d "$branch_name"
    
    # Eliminar rama remota
    git push origin --delete "$branch_name"
    
    echo -e "${GREEN}✅ Hotfix $branch_name finalizado y mergeado en main y develop${NC}"
}

# Función para finalizar release
finish_release() {
    local branch_name=$1
    local version=$(echo "$branch_name" | cut -d'/' -f2)
    
    echo -e "${BLUE}🔄 Finalizando release: $branch_name${NC}"
    
    # Cambiar a main
    git checkout main
    git pull origin main
    
    # Merge del release
    git merge "$branch_name"
    
    # Crear tag
    git tag -a "$version" -m "Release $version"
    
    # Push a main y tag
    git push origin main
    git push origin "$version"
    
    # Cambiar a develop
    git checkout develop
    git pull origin develop
    
    # Merge del release en develop
    git merge "$branch_name"
    
    # Push a develop
    git push origin develop
    
    # Eliminar rama local
    git branch -d "$branch_name"
    
    # Eliminar rama remota
    git push origin --delete "$branch_name"
    
    echo -e "${GREEN}✅ Release $version finalizado y mergeado en main y develop${NC}"
    echo -e "${GREEN}🏷️  Tag $version creado${NC}"
}

# Función para mostrar estado
show_status() {
    echo -e "${CYAN}📊 Estado del repositorio:${NC}"
    echo ""
    
    # Rama actual
    local current_branch=$(git branch --show-current)
    echo -e "${YELLOW}🌿 Rama actual:${NC} $current_branch"
    
    # Estado del working tree
    if git diff-index --quiet HEAD --; then
        echo -e "${GREEN}📁 Working tree:${NC} Limpio"
    else
        echo -e "${RED}📁 Working tree:${NC} Cambios pendientes"
        git status --short
    fi
    
    echo ""
    
    # Ramas locales
    echo -e "${YELLOW}🏠 Ramas locales:${NC}"
    git branch --format='%(HEAD) %(color:yellow)%(refname:short)%(color:reset) - %(subject)'
    
    echo ""
    
    # Ramas remotas
    echo -e "${YELLOW}🌐 Ramas remotas:${NC}"
    git branch -r --format='%(refname:short) - %(subject)'
}

# Función para sincronizar
sync_branches() {
    echo -e "${BLUE}🔄 Sincronizando ramas...${NC}"
    
    # Fetch de cambios remotos
    git fetch origin
    
    # Actualizar main
    git checkout main
    git pull origin main
    
    # Actualizar develop
    git checkout develop
    git pull origin develop
    
    echo -e "${GREEN}✅ Ramas sincronizadas${NC}"
}

# Función principal
main() {
    # Verificar que estamos en un repositorio Git
    check_git_repo
    
    local command=$1
    local option=$2
    
    case $command in
        "feature")
            check_clean_working_tree
            create_feature "$option"
            ;;
        "bugfix")
            check_clean_working_tree
            create_bugfix "$option"
            ;;
        "hotfix")
            check_clean_working_tree
            create_hotfix "$option"
            ;;
        "release")
            check_clean_working_tree
            create_release "$option"
            ;;
        "finish")
            finish_branch "$option"
            ;;
        "status")
            show_status
            ;;
        "sync")
            sync_branches
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Comando no reconocido: $command${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"
