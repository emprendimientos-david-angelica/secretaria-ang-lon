# 🌿 Modelo de Branching - La Secretaria de AngLon

## 📋 **Resumen del Modelo**

Este proyecto utiliza un modelo de branching basado en **Git Flow** adaptado para equipos pequeños y medianos, con protección de la rama principal y flujo de trabajo estandarizado.

## 🏗️ **Estructura de Ramas**

### **🌳 Ramas Principales**

#### **`main` (antes `master`)**
- **Propósito**: Código en producción, estable y funcional
- **Protección**: ✅ **SÍ** - Solo se modifica desde `develop` vía Pull Request
- **Merge directo**: ❌ **NO** - Requiere Pull Request aprobado
- **Origen**: Rama base del proyecto

#### **`develop`**
- **Propósito**: Rama de desarrollo principal, integra todas las features
- **Protección**: ⚠️ **PARCIAL** - Se puede hacer merge directo desde feature branches
- **Merge directo**: ✅ **SÍ** - Desde feature branches
- **Origen**: Rama base para desarrollo de nuevas funcionalidades

### **🌿 Ramas de Desarrollo**

#### **`feature/nombre-funcionalidad`**
- **Propósito**: Desarrollo de nuevas funcionalidades
- **Origen**: `develop`
- **Destino**: `develop` (via Pull Request)
- **Nomenclatura**: `feature/login-system`, `feature/task-management`

#### **`bugfix/nombre-bug`**
- **Propósito**: Corrección de bugs críticos
- **Origen**: `develop`
- **Destino**: `develop` (via Pull Request)
- **Nomenclatura**: `bugfix/login-error`, `bugfix/api-timeout`

#### **`hotfix/nombre-urgente`**
- **Propósito**: Correcciones urgentes en producción
- **Origen**: `main`
- **Destino**: `main` Y `develop` (via Pull Request)
- **Nomenclatura**: `hotfix/security-patch`, `hotfix/critical-error`

#### **`release/version-x.x.x`**
- **Propósito**: Preparación de nueva versión para producción
- **Origen**: `develop`
- **Destino**: `main` Y `develop` (via Pull Request)
- **Nomenclatura**: `release/v1.2.0`, `release/v2.0.0`

## 🔄 **Flujo de Trabajo**

### **1. Desarrollo de Nueva Funcionalidad**

```bash
# 1. Asegurarse de estar en develop actualizada
git checkout develop
git pull origin develop

# 2. Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# 3. Desarrollar y hacer commits
git add .
git commit -m "✨ Agregar nueva funcionalidad"

# 4. Push de la rama
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request en GitHub: feature → develop
```

### **2. Integración de Features**

```bash
# 1. Merge automático desde GitHub (Pull Request)
# 2. O merge manual si es necesario
git checkout develop
git pull origin develop
git merge feature/nueva-funcionalidad
git push origin develop

# 3. Eliminar rama de feature local
git branch -d feature/nueva-funcionalidad
```

### **3. Release a Producción**

```bash
# 1. Crear rama de release desde develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Preparar release (versionado, changelog, etc.)
# 3. Crear Pull Request: release → main
# 4. Aprobar y merge en main
# 5. Crear tag de versión
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# 6. Merge release en develop
git checkout develop
git merge release/v1.2.0
git push origin develop

# 7. Eliminar rama de release
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

### **4. Hotfix Urgente**

```bash
# 1. Crear rama de hotfix desde main
git checkout main
git pull origin main
git checkout -b hotfix/error-critico

# 2. Corregir el bug
git add .
git commit -m "🐛 Corregir error crítico"

# 3. Crear Pull Request: hotfix → main
# 4. Aprobar y merge en main
# 5. Crear tag de hotfix
git checkout main
git pull origin main
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push origin v1.2.1

# 6. Merge hotfix en develop
git checkout develop
git merge hotfix/error-critico
git push origin develop

# 7. Eliminar rama de hotfix
git branch -d hotfix/error-critico
git push origin --delete hotfix/error-critico
```

## 🛡️ **Protección de Ramas**

### **Rama `main`**
- ✅ Requiere Pull Request para merge
- ✅ Requiere revisión de código
- ✅ Requiere tests pasando
- ✅ No permite push directo
- ✅ Solo se puede modificar desde `develop` o `hotfix`

### **Rama `develop`**
- ⚠️ Permite merge directo desde feature branches
- ✅ Requiere Pull Request para cambios directos
- ✅ Requiere tests pasando

## 📝 **Convenciones de Commits**

### **Formato**
```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### **Tipos de Commit**
- **✨ feat**: Nueva funcionalidad
- **🐛 fix**: Corrección de bug
- **📝 docs**: Documentación
- **🎨 style**: Formato, punto y coma faltante, etc.
- **♻️ refactor**: Refactorización de código
- **⚡ perf**: Mejora de rendimiento
- **✅ test**: Agregar o corregir tests
- **🔧 chore**: Cambios en build, configuraciones, etc.

### **Ejemplos**
```bash
git commit -m "✨ feat(auth): implementar sistema de login con JWT"
git commit -m "🐛 fix(tasks): corregir error al eliminar tareas"
git commit -m "📝 docs: actualizar README con instrucciones de instalación"
git commit -m "🎨 style: aplicar formato consistente en componentes"
```

## 🚀 **Comandos Útiles**

### **Ver estado de ramas**
```bash
git branch -a                    # Ver todas las ramas
git branch -vv                   # Ver ramas con tracking
git status                       # Estado actual
```

### **Sincronización**
```bash
git fetch origin                 # Obtener cambios remotos
git pull origin <rama>          # Actualizar rama local
git push origin <rama>          # Subir cambios
```

### **Limpieza**
```bash
git branch -d <rama>            # Eliminar rama local
git push origin --delete <rama> # Eliminar rama remota
git remote prune origin         # Limpiar referencias remotas
```

## 📋 **Checklist de Release**

### **Antes del Release**
- [ ] Todas las features están en `develop`
- [ ] Tests pasando en `develop`
- [ ] Documentación actualizada
- [ ] Changelog preparado

### **Durante el Release**
- [ ] Crear rama `release/vX.X.X`
- [ ] Actualizar versiones en archivos
- [ ] Crear Pull Request a `main`
- [ ] Aprobar y merge

### **Después del Release**
- [ ] Crear tag de versión
- [ ] Merge release en `develop`
- [ ] Eliminar rama de release
- [ ] Desplegar en producción

## 🔧 **Configuración Recomendada**

### **Git Hooks**
- Pre-commit: Linting y tests básicos
- Pre-push: Tests completos
- Commit-msg: Validación de formato

### **GitHub Actions**
- CI/CD automático en Pull Requests
- Tests automáticos en todas las ramas
- Deploy automático en `main`

---

**📚 Referencias:**
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
