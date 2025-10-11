# GratiDay - Capa de Acceso a Datos

## Descripción del Proyecto
Este repositorio contiene la Capa de Acceso a Datos para el proyecto GratiDay desarrollada en Node.js, que proporciona una interfaz robusta y modular para interactuar con la base de datos MySQL.

## Modelo de Datos

### Entidades Principales

#### 1. Usuario (`usuario`)
- **Propósito**: Gestionar usuarios del sistema
- **Campos principales**:
  - `id_user`: Identificador único (AUTO_INCREMENT)
  - `nombre`: Nombre completo del usuario
  - `correo_electronico`: Email único del usuario
  - `password_hash`: Hash seguro de la contraseña
  - `fecha_creacion`: Timestamp de creación
  - `rol`: Rol del usuario ('admin' o 'user')

#### 2. Categoría (`categoria`)
- **Propósito**: Clasificar las frases por temática
- **Campos principales**:
  - `id_category`: Identificador único (AUTO_INCREMENT)
  - `nombre`: Nombre de la categoría (único)
  - `descripcion`: Descripción opcional de la categoría

#### 3. Frase (`frase`)
- **Propósito**: Almacenar las frases de gratitud y motivación
- **Campos principales**:
  - `id_quote`: Identificador único (AUTO_INCREMENT)
  - `texto`: Contenido de la frase
  - `autor`: Autor de la frase (opcional)
  - `fecha_creacion`: Timestamp de creación
  - `scheduled_at`: Fecha programada para publicación
  - `status`: Estado de la frase ('draft', 'scheduled', 'published')
  - `creado_por`: ID del usuario creador (FK)
  - `categoria_id`: ID de la categoría (FK)

### Relaciones

- **Usuario → Frase**: Un usuario puede crear múltiples frases (1:N)
- **Categoría → Frase**: Una categoría puede contener múltiples frases (1:N)

## Instalación y Configuración

### Requisitos Previos

- Node.js (versión 14 o superior)
- MySQL (versión 5.7 o superior)
- XAMPP (para desarrollo local)

### Pasos de Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd Asignacion08
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar la base de datos**:
   - Importar el archivo `SQL/database.sql` en phpMyAdmin
   - Verificar que la base de datos `gratiday` se haya creado correctamente

4. **Configurar variables de entorno**:
   ```bash
   cp config.example.env .env
   ```
   Editar el archivo `.env` con tus credenciales de base de datos:
   ```
   DB_HOST=NOMBRE_DEL_HOST
   DB_PORT=PUERTO_DEL_HOST
   DB_USER=USUARIO
   DB_PASSWORD=PASSWORD
   DB_NAME=gratiday
   DB_CHARSET=utf8mb4
   ```

5. **Usar la consola interactiva**:
   ```bash
   npm run console
   ```

## Consola Interactiva

Esta interfaz amigable proporciona acceso a todas las operaciones CRUD de manera fácil y visual. Permite gestionar completamente la plataforma desde la terminal

### Características de la Consola

- **Interfaz intuitiva** con menús interactivos
- **Gestión completa de usuarios** (crear, actualizar, autenticar, eliminar)
- **Administración de categorías** con estadísticas
- **Gestión avanzada de frases** (crear, publicar, programar, buscar)
- **Estadísticas en tiempo real** del sistema
- **Búsquedas avanzadas** por texto, categoría y usuario
- **Validación completa** de datos de entrada
- **Tablas formateadas** para mejor visualización

### Iniciar la Consola

```bash
npm run console
```

### Menú Principal

La consola ofrece las siguientes opciones:

- **Gestionar Usuarios**: Crear, actualizar, buscar y eliminar usuarios
- **Gestionar Categorías**: Administrar categorías de frases
- **Gestionar Frases**: Crear, publicar, programar y gestionar frases
- **Ver Estadísticas**: Monitorear el uso y actividad del sistema
- **Búsquedas Avanzadas**: Encontrar contenido específico
- **Salir**: Cerrar la aplicación

### Guía de Uso de la Consola

#### Inicio Rápido

1. **Inicia la consola:**
   ```bash
   npm run console
   ```

2. **Crea un usuario administrador:**
   - Selecciona "Gestionar Usuarios"
   - Elige "Crear Usuario"
   - Completa la información del usuario

3. **Crea algunas categorías:**
   - Selecciona "Gestionar Categorías"
   - Elige "Crear Categoría"
   - Crea categorías como "Gratitud", "Motivación", "Esperanza"

4. **Crea tus primeras frases:**
   - Selecciona "Gestionar Frases"
   - Elige "Crear Frase"
   - Completa el texto y selecciona categoría

#### Navegación

- **Flechas ↑↓**: Navegar por las opciones del menú
- **Enter**: Seleccionar opción
- **Ctrl+C**: Salir de la aplicación en cualquier momento

#### Operaciones Comunes

**Crear un Usuario Nuevo**
1. Menú Principal → "Gestionar Usuarios"
2. "Crear Usuario"
3. Ingresa: nombre, email, contraseña, rol
4. Usuario creado con ID asignado

**Crear una Categoría**
1. Menú Principal → "Gestionar Categorías"
2. "Crear Categoría"
3. Ingresa: nombre y descripción
4. Categoría creada

**Crear y Publicar una Frase**
1. Menú Principal → "Gestionar Frases"
2. "Crear Frase"
3. Ingresa: texto, autor, selecciona usuario y categoría
4. Elige estado "Publicada"
5. Frase creada y publicada

**Buscar Frases por Texto**
1. Menú Principal → "Búsquedas Avanzadas"
2. "Buscar Frases por Texto"
3. Ingresa término de búsqueda
4. Ve los resultados en tabla

#### Características Técnicas de la Consola

**Validación de Datos**
- **Emails**: Validación de formato correcto
- **Contraseñas**: Mínimo 6 caracteres
- **Nombres**: Mínimo 2 caracteres
- **Texto de frases**: Mínimo 10 caracteres
- **Fechas**: Validación de fechas futuras para programación

**Manejo de Errores**
- Mensajes de error específicos y claros
- Validación antes de operaciones de base de datos
- Confirmaciones para operaciones destructivas
- Manejo de dependencias (no eliminar categorías con frases)

**Seguridad**
- Contraseñas hasheadas con PBKDF2
- Validación de entrada para prevenir inyección
- Confirmaciones para operaciones críticas

#### Estadísticas Disponibles

La consola proporciona estadísticas detalladas:

- **Totales**: Usuarios, categorías, frases
- **Por Estado**: Frases publicadas, borradores, programadas
- **Por Categoría**: Conteos específicos por categoría
- **Usuarios Activos**: Cantidad de usuarios que han creado frases

#### Casos de Uso Típicos

**1. Administrador del Sistema**
- Crear usuarios y asignar roles
- Gestionar categorías
- Revisar y aprobar frases
- Ver estadísticas del sistema

**2. Usuario Regular**
- Crear frases en borrador
- Programar publicación de frases
- Buscar frases existentes
- Ver frases aleatorias para inspiración

**3. Moderador de Contenido**
- Revisar frases en borrador
- Cambiar estados de frases
- Buscar contenido específico
- Gestionar categorías

#### Solución de Problemas

**Error de Conexión a Base de Datos**
```
Error al conectar con la base de datos: ECONNREFUSED
```
**Solución**: Verifica que XAMPP esté ejecutándose y MySQL esté activo

**Error de Validación**
```
Datos inválidos: El email debe ser válido
```
**Solución**: Verifica el formato del email (usuario@dominio.com)

**No se Encuentran Usuarios/Categorías**
```
No hay usuarios disponibles. Crea un usuario primero.
```
**Solución**: Crea usuarios y categorías antes de crear frases

#### Consejos de Uso

1. **Orden de Creación**: Crea usuarios y categorías antes de crear frases
2. **Estados de Frases**: Usa borradores para trabajo en progreso
3. **Programación**: Programa frases para publicación automática
4. **Búsquedas**: Usa búsquedas avanzadas para encontrar contenido específico
5. **Estadísticas**: Revisa estadísticas regularmente para monitorear el sistema

#### Flujo de Trabajo Recomendado

1. **Configuración Inicial**:
   - Crear usuario administrador
   - Crear categorías básicas
   - Configurar primeras frases

2. **Operaciones Diarias**:
   - Revisar frases en borrador
   - Programar publicaciones
   - Monitorear estadísticas

3. **Mantenimiento**:
   - Limpiar frases antiguas
   - Actualizar categorías
   - Gestionar usuarios

## Justificación de la Base de Datos

### Elección de MySQL

**MySQL** fue seleccionado como sistema de gestión de base de datos por las siguientes razones:

1. **Compatibilidad con XAMPP**: Integración perfecta con el entorno de desarrollo local
2. **Madurez y estabilidad**: Sistema probado y confiable para aplicaciones web
3. **Rendimiento**: Excelente rendimiento para consultas complejas y grandes volúmenes de datos
4. **Características avanzadas**: Soporte para transacciones, índices, y restricciones de integridad
5. **Comunidad y documentación**: Amplia documentación y soporte de la comunidad
6. **Escalabilidad**: Capacidad de manejar crecimiento de datos y usuarios

### Optimizaciones Implementadas

- **Índices estratégicos**: Índices en campos de búsqueda frecuente
- **Charset UTF8MB4**: Soporte completo para caracteres Unicode
- **Restricciones de integridad**: Claves foráneas para mantener consistencia
- **Tipos de datos optimizados**: Selección apropiada de tipos de datos para cada campo


## Scripts Disponibles

```bash
# Ejecutar la consola interactiva
npm run console

# Punto de entrada principal
npm start

# Desarrollo con auto-reload
npm run dev
```

