# GratiDay - Capa de Acceso a Datos

## Descripción
Este repositorio contiene la Asignación #8 de la materia Temas Emergentes de Aplicaciones Web que consiste en la creación de una Capa de Acceso a Datos para el proyecto GratiDay, la cual se desarrolló en Node.js, que proporciona una interfaz robusta y modular para interactuar con una base de datos MySQL.

## Modelo de Datos
#### 1. Usuario ("usuario")
- **Propósito**: Gestionar usuarios del sistema
- **Campos principales**:
  - id_user: Identificador único (Autoincrementable)
  - nombre: Nombre completo del usuario
  - correo_electronico: Email único del usuario
  - password_hash: Hash seguro de la contraseña
  - fecha_creacion: Timestamp de creación
  - rol: Rol del usuario ("admin" o "user")
#### 2. Categoría ("categoria")
- **Propósito**: Clasificar las frases por temática
- **Campos principales**:
  - id_category: Identificador único (Autoincrementable)
  - nombre: Nombre de la categoría (único)
  - descripcion: Descripción opcional de la categoría
#### 3. Frase ("frase")
- **Propósito**: Almacenar las frases de gratitud y motivación
- **Campos principales**:
  - id_quote: Identificador único (AUTO_INCREMENT)
  - texto: Contenido de la frase
  - autor: Autor de la frase (opcional)
  - fecha_creacion: Timestamp de creación
  - scheduled_at: Fecha programada para publicación
  - status: Estado de la frase ('draft', 'scheduled', 'published')
  - creado_por: ID del usuario creador (FK)
  - categoria_id: ID de la categoría (FK)

## Relaciones
- **Usuario a Frase**: Un usuario puede crear múltiples frases (1:N)
- **Categoría a Frase**: Una categoría puede contener múltiples frases (1:N)

## Requisitos
Para este proyecto, usamos:
- Node.js
- MySQL
- XAMPP (se utilizó para el despliegue local)

## Pasos de Instalación
1. **Instalar dependencias en la carpeta del proyecto**:
   En la consola de comandos, escribir "npm install" para instalar las dependencias necesarias. Previo a esto, se debe tener instalado Node.js en nuestro ordenador.
2. **Configurar la base de datos**:
   Hay que importar el archivo "SQL/database.sql" en phpMyAdmin y verificar que la base de datos "gratiday" se haya creado correctamente.
3. **Configurar variables de entorno**:
   Se debe crear un archivo en el proyecto llamado "config.example.env" y editarlo con tus credenciales de base de datos:
   - DB_HOST=NOMBRE_DEL_HOST
   - DB_PORT=PUERTO_DEL_HOST
   - DB_USER=USUARIO
   - DB_PASSWORD=PASSWORD
   - DB_NAME=gratiday
   - DB_CHARSET=utf8mb4
5. **Usar la consola interactiva**:
   Por medio de "npm run console" se puede correr la consola con los métodos CRUD.

## Opciones de la Consola

La consola ofrece las siguientes opciones:
- **Gestionar Usuarios**: Crea, actualiza, busca y elimina usuarios
- **Gestionar Categorías**: Administra categorías de frases
- **Gestionar Frases**: Crea, publica, programa y gestiona frases
- **Ver Estadísticas**: Monitorea el uso y actividad del sistema
- **Búsquedas Avanzadas**: Busca contenido específico
- **Salir**: Cierra la aplicación

#### Navegación

- **Flechas Arriba y Abajo**: Se usan para navegar por las opciones del menú
- **Enter**: Selecciona una opción
- **Ctrl+C**: Permite salir de la aplicación en cualquier momento

## Posibles fallos comúnes

**Error de Conexión a Base de Datos**: Error al conectar con la base de datos: ECONNREFUSED
- **Solución**: Verifica que XAMPP esté ejecutándose y MySQL esté activo

**Error de Validación**: Datos inválidos: El email debe ser válido
- **Solución**: Verifica el formato del email (usuario@dominio.com)

**No se Encuentran Usuarios/Categorías**: No hay usuarios disponibles. Crea un usuario primero.
- **Solución**: Crea usuarios y categorías antes de crear frases


