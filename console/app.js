/**
 * Aplicación de Consola Interactiva para GratiDay
 * Permite realizar operaciones CRUD de manera amigable desde la terminal
 */

const inquirer = require('inquirer');
const { Database, Usuario, Categoria, Frase } = require('../src/index');

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`${message}`, 'green');
}

function logError(message) {
    log(`${message}`, 'red');
}

function logInfo(message) {
    log(`${message}`, 'blue');
}

function logWarning(message) {
    log(`${message}`, 'yellow');
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(`${title}`, 'bright');
    console.log('='.repeat(60));
}

/**
 * Función helper para agregar opción de regreso al menú principal
 */
function addMainMenuOption(choices) {
    return [...choices, { name: 'Volver al Menú Principal', value: 'main' }];
}

/**
 * Clase principal de la aplicación de consola
 */
class GratiDayConsole {
    constructor() {
        this.db = new Database();
        this.currentUser = null;
    }

    /**
     * Inicia la aplicación
     */
    async start() {
        try {
            logSection('GRATIDAY - CAPA DE ACCESO A DATOS POR CONSOLA');
            log('', 'reset');
        log('NAVEGACION:', 'yellow');
        log('   - Usa las flechas para navegar', 'blue');
        log('   - Presiona Enter para seleccionar', 'blue');
        log('   - Siempre puedes regresar al menu principal', 'blue');
        log('   - Presiona Ctrl+C para salir en cualquier momento', 'blue');
            log('', 'reset');
            
            // Conectar a la base de datos
            await this.db.connect();
            logSuccess('Conectado a la base de datos');
            
            // Mostrar menú principal
            await this.showMainMenu();
            
        } catch (error) {
            logError(`Error al iniciar la aplicación: ${error.message}`);
            process.exit(1);
        }
    }

    /**
     * Muestra el menú principal
     */
    async showMainMenu() {
        logInfo('Tip: Siempre puedes usar "Volver al Menu Principal" para regresar aqui');
        
        const choices = [
            { name: 'Gestionar Usuarios', value: 'usuarios' },
            { name: 'Gestionar Categorias', value: 'categorias' },
            { name: 'Gestionar Frases', value: 'frases' },
            { name: 'Ver Estadisticas', value: 'estadisticas' },
            { name: 'Busquedas Avanzadas', value: 'busquedas' },
            new inquirer.Separator('─'.repeat(50)),
            { name: 'Salir de la aplicacion', value: 'salir' }
        ];

        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: '¿Qué deseas hacer?',
                choices: choices,
                pageSize: 10
            }
        ]);

        switch (action) {
            case 'usuarios':
                await this.showUserMenu();
                break;
            case 'categorias':
                await this.showCategoryMenu();
                break;
            case 'frases':
                await this.showQuoteMenu();
                break;
            case 'estadisticas':
                await this.showStatistics();
                break;
            case 'busquedas':
                await this.showSearchMenu();
                break;
            case 'salir':
                await this.exit();
                break;
        }
    }

    /**
     * Menú de gestión de usuarios
     */
    async showUserMenu() {
        logSection('GESTIÓN DE USUARIOS');
        
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Operaciones de usuarios:',
                choices: [
                    { name: 'Crear Usuario', value: 'create' },
                    { name: 'Listar Usuarios', value: 'list' },
                    { name: 'Buscar Usuario por ID', value: 'findById' },
                    { name: 'Buscar Usuario por Email', value: 'findByEmail' },
                    { name: 'Actualizar Usuario', value: 'update' },
                    { name: 'Cambiar Contraseña', value: 'changePassword' },
                    { name: 'Eliminar Usuario', value: 'delete' },
                    { name: 'Autenticar Usuario', value: 'authenticate' },
                    { name: 'Volver al Menu Principal', value: 'back' }
                ],
                pageSize: 10
            }
        ]);

        switch (action) {
            case 'create':
                await this.createUser();
                break;
            case 'list':
                await this.listUsers();
                break;
            case 'findById':
                await this.findUserById();
                break;
            case 'findByEmail':
                await this.findUserByEmail();
                break;
            case 'update':
                await this.updateUser();
                break;
            case 'changePassword':
                await this.changeUserPassword();
                break;
            case 'delete':
                await this.deleteUser();
                break;
            case 'authenticate':
                await this.authenticateUser();
                break;
            case 'back':
                await this.showMainMenu();
                break;
        }
    }

    /**
     * Crear un nuevo usuario
     */
    async createUser() {
        logSection('CREAR NUEVO USUARIO');
        
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'nombre',
                message: 'Nombre completo:',
                validate: (input) => input.length >= 2 || 'El nombre debe tener al menos 2 caracteres'
            },
            {
                type: 'input',
                name: 'correo_electronico',
                message: 'Correo electrónico:',
                validate: (input) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(input) || 'Ingresa un correo electrónico válido';
                }
            },
            {
                type: 'password',
                name: 'password',
                message: 'Contraseña:',
                validate: (input) => input.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
            },
            {
                type: 'list',
                name: 'rol',
                message: 'Rol del usuario:',
                choices: [
                    { name: 'Usuario Regular', value: 'user' },
                    { name: 'Administrador', value: 'admin' }
                ]
            }
        ]);

        try {
            const usuario = new Usuario({
                nombre: answers.nombre,
                correo_electronico: answers.correo_electronico,
                rol: answers.rol
            });

            await usuario.create(answers.password);
            logSuccess(`Usuario creado exitosamente con ID: ${usuario.id_user}`);
            
        } catch (error) {
            logError(`Error al crear usuario: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Listar usuarios
     */
    async listUsers() {
        logSection('LISTA DE USUARIOS');
        
        try {
            const { limit } = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'limit',
                    message: 'Número de usuarios a mostrar:',
                    default: 10,
                    validate: (input) => input > 0 || 'Debe ser un número positivo'
                }
            ]);

            const usuarios = await Usuario.findAll(limit);
            
            if (usuarios.length === 0) {
                logWarning('No se encontraron usuarios');
            } else {
                console.table(usuarios.map(u => ({
                    ID: u.id_user,
                    Nombre: u.nombre,
                    Email: u.correo_electronico,
                    Rol: u.rol,
                    'Fecha Creación': new Date(u.fecha_creacion).toLocaleDateString()
                })));
            }
            
        } catch (error) {
            logError(`Error al listar usuarios: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Buscar usuario por ID
     */
    async findUserById() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID del usuario:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const usuario = await Usuario.findById(id);
            
            if (usuario) {
                logSection('USUARIO ENCONTRADO');
                console.table([{
                    ID: usuario.id_user,
                    Nombre: usuario.nombre,
                    Email: usuario.correo_electronico,
                    Rol: usuario.rol,
                    'Fecha Creación': new Date(usuario.fecha_creacion).toLocaleDateString()
                }]);
            } else {
                logWarning('Usuario no encontrado');
            }
            
        } catch (error) {
            logError(`Error al buscar usuario: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Buscar usuario por email
     */
    async findUserByEmail() {
        const { email } = await inquirer.prompt([
            {
                type: 'input',
                name: 'email',
                message: 'Correo electrónico:',
                validate: (input) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(input) || 'Ingresa un correo electrónico válido';
                }
            }
        ]);

        try {
            const usuario = await Usuario.findByEmail(email);
            
            if (usuario) {
                logSection('USUARIO ENCONTRADO');
                console.table([{
                    ID: usuario.id_user,
                    Nombre: usuario.nombre,
                    Email: usuario.correo_electronico,
                    Rol: usuario.rol,
                    'Fecha Creación': new Date(usuario.fecha_creacion).toLocaleDateString()
                }]);
            } else {
                logWarning('Usuario no encontrado');
            }
            
        } catch (error) {
            logError(`Error al buscar usuario: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Actualizar usuario
     */
    async updateUser() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID del usuario a actualizar:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const usuario = await Usuario.findById(id);
            
            if (!usuario) {
                logWarning('Usuario no encontrado');
                await this.pauseAndReturn();
                return;
            }

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'nombre',
                    message: 'Nuevo nombre:',
                    default: usuario.nombre,
                    validate: (input) => input.length >= 2 || 'El nombre debe tener al menos 2 caracteres'
                },
                {
                    type: 'input',
                    name: 'correo_electronico',
                    message: 'Nuevo correo electrónico:',
                    default: usuario.correo_electronico,
                    validate: (input) => {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        return emailRegex.test(input) || 'Ingresa un correo electrónico válido';
                    }
                },
                {
                    type: 'list',
                    name: 'rol',
                    message: 'Nuevo rol:',
                    choices: [
                        { name: 'Usuario Regular', value: 'user' },
                        { name: 'Administrador', value: 'admin' }
                    ],
                    default: usuario.rol
                }
            ]);

            await usuario.update(answers);
            logSuccess('Usuario actualizado exitosamente');
            
        } catch (error) {
            logError(`Error al actualizar usuario: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Cambiar contraseña de usuario
     */
    async changeUserPassword() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID del usuario:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const usuario = await Usuario.findById(id);
            
            if (!usuario) {
                logWarning('Usuario no encontrado');
                await this.pauseAndReturn();
                return;
            }

            const { password } = await inquirer.prompt([
                {
                    type: 'password',
                    name: 'password',
                    message: 'Nueva contraseña:',
                    validate: (input) => input.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
                }
            ]);

            await usuario.updatePassword(password);
            logSuccess('Contraseña actualizada exitosamente');
            
        } catch (error) {
            logError(`Error al cambiar contraseña: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Eliminar usuario
     */
    async deleteUser() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID del usuario a eliminar:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const usuario = await Usuario.findById(id);
            
            if (!usuario) {
                logWarning('Usuario no encontrado');
                await this.pauseAndReturn();
                return;
            }

            const { confirm } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: `¿Estás seguro de eliminar al usuario "${usuario.nombre}"?`,
                    default: false
                }
            ]);

            if (confirm) {
                const deleted = await usuario.delete();
                if (deleted) {
                    logSuccess('Usuario eliminado exitosamente');
                } else {
                    logWarning('No se pudo eliminar el usuario');
                }
            } else {
                logInfo('Operación cancelada');
            }
            
        } catch (error) {
            logError(`Error al eliminar usuario: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Autenticar usuario
     */
    async authenticateUser() {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'email',
                message: 'Correo electrónico:',
                validate: (input) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(input) || 'Ingresa un correo electrónico válido';
                }
            },
            {
                type: 'password',
                name: 'password',
                message: 'Contraseña:'
            }
        ]);

        try {
            const usuario = await Usuario.authenticate(answers.email, answers.password);
            
            if (usuario) {
                logSection('AUTENTICACIÓN EXITOSA');
                console.table([{
                    ID: usuario.id_user,
                    Nombre: usuario.nombre,
                    Email: usuario.correo_electronico,
                    Rol: usuario.rol
                }]);
                this.currentUser = usuario;
            } else {
                logError('Credenciales inválidas');
            }
            
        } catch (error) {
            logError(`Error al autenticar: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Menú de gestión de categorías
     */
    async showCategoryMenu() {
        logSection('GESTIÓN DE CATEGORÍAS');
        
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Operaciones de categorías:',
                choices: [
                    { name: 'Crear Categoria', value: 'create' },
                    { name: 'Listar Categorias', value: 'list' },
                    { name: 'Buscar Categoria por ID', value: 'findById' },
                    { name: 'Buscar Categoria por Nombre', value: 'findByName' },
                    { name: 'Actualizar Categoria', value: 'update' },
                    { name: 'Eliminar Categoria', value: 'delete' },
                    { name: 'Ver Estadisticas de Categoria', value: 'stats' },
                    { name: 'Volver al Menu Principal', value: 'back' }
                ],
                pageSize: 10
            }
        ]);

        switch (action) {
            case 'create':
                await this.createCategory();
                break;
            case 'list':
                await this.listCategories();
                break;
            case 'findById':
                await this.findCategoryById();
                break;
            case 'findByName':
                await this.findCategoryByName();
                break;
            case 'update':
                await this.updateCategory();
                break;
            case 'delete':
                await this.deleteCategory();
                break;
            case 'stats':
                await this.showCategoryStats();
                break;
            case 'back':
                await this.showMainMenu();
                break;
        }
    }

    /**
     * Crear nueva categoría
     */
    async createCategory() {
        logSection('CREAR NUEVA CATEGORÍA');
        
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'nombre',
                message: 'Nombre de la categoría:',
                validate: (input) => input.length >= 2 || 'El nombre debe tener al menos 2 caracteres'
            },
            {
                type: 'input',
                name: 'descripcion',
                message: 'Descripción (opcional):'
            }
        ]);

        try {
            const categoria = new Categoria({
                nombre: answers.nombre,
                descripcion: answers.descripcion || ''
            });

            await categoria.create();
            logSuccess(`Categoría creada exitosamente con ID: ${categoria.id_category}`);
            
        } catch (error) {
            logError(`Error al crear categoría: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Listar categorías
     */
    async listCategories() {
        logSection('LISTA DE CATEGORÍAS');
        
        try {
            const { limit } = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'limit',
                    message: 'Número de categorías a mostrar:',
                    default: 20,
                    validate: (input) => input > 0 || 'Debe ser un número positivo'
                }
            ]);

            const categorias = await Categoria.findAll(limit);
            
            if (categorias.length === 0) {
                logWarning('No se encontraron categorías');
            } else {
                console.table(categorias.map(c => ({
                    ID: c.id_category,
                    Nombre: c.nombre,
                    Descripción: c.descripcion || 'Sin descripción'
                })));
            }
            
        } catch (error) {
            logError(`Error al listar categorías: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Buscar categoría por ID
     */
    async findCategoryById() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID de la categoría:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const categoria = await Categoria.findById(id);
            
            if (categoria) {
                logSection('CATEGORÍA ENCONTRADA');
                console.table([{
                    ID: categoria.id_category,
                    Nombre: categoria.nombre,
                    Descripción: categoria.descripcion || 'Sin descripción'
                }]);
            } else {
                logWarning('Categoría no encontrada');
            }
            
        } catch (error) {
            logError(`Error al buscar categoría: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Buscar categoría por nombre
     */
    async findCategoryByName() {
        const { nombre } = await inquirer.prompt([
            {
                type: 'input',
                name: 'nombre',
                message: 'Nombre de la categoría:',
                validate: (input) => input.length > 0 || 'Debe ingresar un nombre'
            }
        ]);

        try {
            const categoria = await Categoria.findByNombre(nombre);
            
            if (categoria) {
                logSection('CATEGORÍA ENCONTRADA');
                console.table([{
                    ID: categoria.id_category,
                    Nombre: categoria.nombre,
                    Descripción: categoria.descripcion || 'Sin descripción'
                }]);
            } else {
                logWarning('Categoría no encontrada');
            }
            
        } catch (error) {
            logError(`Error al buscar categoría: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Actualizar categoría
     */
    async updateCategory() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID de la categoría a actualizar:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const categoria = await Categoria.findById(id);
            
            if (!categoria) {
                logWarning('Categoría no encontrada');
                await this.pauseAndReturn();
                return;
            }

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'nombre',
                    message: 'Nuevo nombre:',
                    default: categoria.nombre,
                    validate: (input) => input.length >= 2 || 'El nombre debe tener al menos 2 caracteres'
                },
                {
                    type: 'input',
                    name: 'descripcion',
                    message: 'Nueva descripción:',
                    default: categoria.descripcion
                }
            ]);

            await categoria.update(answers);
            logSuccess('Categoría actualizada exitosamente');
            
        } catch (error) {
            logError(`Error al actualizar categoría: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Eliminar categoría
     */
    async deleteCategory() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID de la categoría a eliminar:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const categoria = await Categoria.findById(id);
            
            if (!categoria) {
                logWarning('Categoría no encontrada');
                await this.pauseAndReturn();
                return;
            }

            // Verificar si tiene frases asociadas
            const frasesCount = await categoria.getFrasesCount();
            
            const { confirm } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: `¿Estás seguro de eliminar la categoría "${categoria.nombre}"?${frasesCount > 0 ? ` (Tiene ${frasesCount} frases asociadas)` : ''}`,
                    default: false
                }
            ]);

            if (confirm) {
                const { forceDelete } = frasesCount > 0 ? await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'forceDelete',
                        message: 'La categoría tiene frases asociadas. ¿Eliminar de todas formas?',
                        default: false
                    }
                ]) : { forceDelete: false };

                const deleted = await categoria.delete(forceDelete);
                if (deleted) {
                    logSuccess('Categoría eliminada exitosamente');
                } else {
                    logWarning('No se pudo eliminar la categoría');
                }
            } else {
                logInfo('Operación cancelada');
            }
            
        } catch (error) {
            logError(`Error al eliminar categoría: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Mostrar estadísticas de categoría
     */
    async showCategoryStats() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID de la categoría:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const categoria = await Categoria.findById(id);
            
            if (!categoria) {
                logWarning('Categoría no encontrada');
                await this.pauseAndReturn();
                return;
            }

            const stats = await categoria.getStats();
            
            logSection(`ESTADÍSTICAS DE: ${categoria.nombre.toUpperCase()}`);
            console.table([{
                'Total Frases': stats.total_frases,
                'Frases Publicadas': stats.frases_publicadas,
                'Frases en Borrador': stats.frases_borrador,
                'Frases Programadas': stats.frases_programadas
            }]);
            
        } catch (error) {
            logError(`Error al obtener estadísticas: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Menú de gestión de frases
     */
    async showQuoteMenu() {
        logSection('GESTIÓN DE FRASES');
        
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Operaciones de frases:',
                choices: [
                    { name: 'Crear Frase', value: 'create' },
                    { name: 'Listar Frases', value: 'list' },
                    { name: 'Buscar Frase por ID', value: 'findById' },
                    { name: 'Frases Publicadas', value: 'published' },
                    { name: 'Frases en Borrador', value: 'draft' },
                    { name: 'Frases Programadas', value: 'scheduled' },
                    { name: 'Frases Aleatorias', value: 'random' },
                    { name: 'Actualizar Frase', value: 'update' },
                    { name: 'Publicar Frase', value: 'publish' },
                    { name: 'Programar Frase', value: 'schedule' },
                    { name: 'Cambiar a Borrador', value: 'draft' },
                    { name: 'Eliminar Frase', value: 'delete' },
                    { name: 'Volver al Menu Principal', value: 'back' }
                ],
                pageSize: 15
            }
        ]);

        switch (action) {
            case 'create':
                await this.createQuote();
                break;
            case 'list':
                await this.listQuotes();
                break;
            case 'findById':
                await this.findQuoteById();
                break;
            case 'published':
                await this.listPublishedQuotes();
                break;
            case 'draft':
                await this.listDraftQuotes();
                break;
            case 'scheduled':
                await this.listScheduledQuotes();
                break;
            case 'random':
                await this.showRandomQuotes();
                break;
            case 'update':
                await this.updateQuote();
                break;
            case 'publish':
                await this.publishQuote();
                break;
            case 'schedule':
                await this.scheduleQuote();
                break;
            case 'draft':
                await this.draftQuote();
                break;
            case 'delete':
                await this.deleteQuote();
                break;
            case 'back':
                await this.showMainMenu();
                break;
        }
    }

    /**
     * Crear nueva frase
     */
    async createQuote() {
        logSection('CREAR NUEVA FRASE');
        
        try {
            // Obtener usuarios disponibles
            const usuarios = await Usuario.findAll(100);
            const categorias = await Categoria.findAll(100);
            
            if (usuarios.length === 0) {
                logError('No hay usuarios disponibles. Crea un usuario primero.');
                await this.pauseAndReturn();
                return;
            }
            
            if (categorias.length === 0) {
                logError('No hay categorías disponibles. Crea una categoría primero.');
                await this.pauseAndReturn();
                return;
            }

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'texto',
                    message: 'Texto de la frase:',
                    validate: (input) => input.length >= 10 || 'El texto debe tener al menos 10 caracteres'
                },
                {
                    type: 'input',
                    name: 'autor',
                    message: 'Autor (opcional):'
                },
                {
                    type: 'list',
                    name: 'creado_por',
                    message: 'Usuario creador:',
                    choices: usuarios.map(u => ({ name: u.nombre, value: u.id_user }))
                },
                {
                    type: 'list',
                    name: 'categoria_id',
                    message: 'Categoría:',
                    choices: categorias.map(c => ({ name: c.nombre, value: c.id_category }))
                },
                {
                    type: 'list',
                    name: 'status',
                    message: 'Estado inicial:',
                    choices: [
                        { name: 'Borrador', value: 'draft' },
                        { name: 'Publicada', value: 'published' },
                        { name: 'Programada', value: 'scheduled' }
                    ]
                }
            ]);

            let scheduled_at = null;
            if (answers.status === 'scheduled') {
                const { fecha } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'fecha',
                        message: 'Fecha de publicación programada (YYYY-MM-DD HH:MM):',
                        validate: (input) => {
                            const date = new Date(input);
                            return !isNaN(date.getTime()) && date > new Date() || 'Debe ser una fecha futura válida';
                        }
                    }
                ]);
                scheduled_at = new Date(fecha);
            }

            const frase = new Frase({
                texto: answers.texto,
                autor: answers.autor || '',
                status: answers.status,
                creado_por: answers.creado_por,
                categoria_id: answers.categoria_id,
                scheduled_at: scheduled_at
            });

            await frase.create();
            logSuccess(`Frase creada exitosamente con ID: ${frase.id_quote}`);
            
        } catch (error) {
            logError(`Error al crear frase: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Listar frases
     */
    async listQuotes() {
        logSection('LISTA DE FRASES');
        
        try {
            const answers = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'limit',
                    message: 'Número de frases a mostrar:',
                    default: 10,
                    validate: (input) => input > 0 || 'Debe ser un número positivo'
                },
                {
                    type: 'list',
                    name: 'status',
                    message: 'Filtrar por estado:',
                    choices: [
                        { name: 'Todas', value: '' },
                        { name: 'Publicadas', value: 'published' },
                        { name: 'Borrador', value: 'draft' },
                        { name: 'Programadas', value: 'scheduled' }
                    ]
                }
            ]);

            const filters = answers.status ? { status: answers.status } : {};
            const frases = await Frase.findAll(filters, answers.limit);
            
            if (frases.length === 0) {
                logWarning('No se encontraron frases');
            } else {
                console.table(frases.map(f => ({
                    ID: f.id_quote,
                    Texto: f.texto.substring(0, 50) + '...',
                    Autor: f.autor || 'Anónimo',
                    Estado: f.status,
                    Categoría: f.categoria_nombre,
                    Creador: f.creado_por_nombre,
                    'Fecha Creación': new Date(f.fecha_creacion).toLocaleDateString()
                })));
            }
            
        } catch (error) {
            logError(`Error al listar frases: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Buscar frase por ID
     */
    async findQuoteById() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID de la frase:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const frase = await Frase.findById(id);
            
            if (frase) {
                logSection('FRASE ENCONTRADA');
                console.table([{
                    ID: frase.id_quote,
                    Texto: frase.texto,
                    Autor: frase.autor || 'Anónimo',
                    Estado: frase.status,
                    Categoría: frase.categoria_nombre,
                    Creador: frase.creado_por_nombre,
                    'Fecha Creación': new Date(frase.fecha_creacion).toLocaleDateString(),
                    'Programada para': frase.scheduled_at ? new Date(frase.scheduled_at).toLocaleString() : 'No programada'
                }]);
            } else {
                logWarning('Frase no encontrada');
            }
            
        } catch (error) {
            logError(`Error al buscar frase: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Listar frases publicadas
     */
    async listPublishedQuotes() {
        logSection('FRASES PUBLICADAS');
        
        try {
            const { limit } = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'limit',
                    message: 'Número de frases a mostrar:',
                    default: 10,
                    validate: (input) => input > 0 || 'Debe ser un número positivo'
                }
            ]);

            const frases = await Frase.findPublished(limit);
            
            if (frases.length === 0) {
                logWarning('No se encontraron frases publicadas');
            } else {
                console.table(frases.map(f => ({
                    ID: f.id_quote,
                    Texto: f.texto.substring(0, 60) + '...',
                    Autor: f.autor || 'Anónimo',
                    Categoría: f.categoria_nombre,
                    Creador: f.creado_por_nombre
                })));
            }
            
        } catch (error) {
            logError(`Error al listar frases publicadas: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Listar frases en borrador
     */
    async listDraftQuotes() {
        logSection('FRASES EN BORRADOR');
        
        try {
            const frases = await Frase.findAll({ status: 'draft' }, 20);
            
            if (frases.length === 0) {
                logWarning('No se encontraron frases en borrador');
            } else {
                console.table(frases.map(f => ({
                    ID: f.id_quote,
                    Texto: f.texto.substring(0, 60) + '...',
                    Autor: f.autor || 'Anónimo',
                    Categoría: f.categoria_nombre,
                    Creador: f.creado_por_nombre
                })));
            }
            
        } catch (error) {
            logError(`Error al listar frases en borrador: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Listar frases programadas
     */
    async listScheduledQuotes() {
        logSection('FRASES PROGRAMADAS');
        
        try {
            const frases = await Frase.findScheduled();
            
            if (frases.length === 0) {
                logWarning('No se encontraron frases programadas');
            } else {
                console.table(frases.map(f => ({
                    ID: f.id_quote,
                    Texto: f.texto.substring(0, 60) + '...',
                    Autor: f.autor || 'Anónimo',
                    'Programada para': new Date(f.scheduled_at).toLocaleString(),
                    Creador: f.creado_por_nombre
                })));
            }
            
        } catch (error) {
            logError(`Error al listar frases programadas: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Mostrar frases aleatorias
     */
    async showRandomQuotes() {
        logSection('FRASES ALEATORIAS');
        
        try {
            const { count } = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'count',
                    message: 'Número de frases aleatorias:',
                    default: 3,
                    validate: (input) => input > 0 && input <= 10 || 'Debe ser un número entre 1 y 10'
                }
            ]);

            const frases = await Frase.findRandom(count);
            
            if (frases.length === 0) {
                logWarning('No se encontraron frases publicadas');
            } else {
                frases.forEach((frase, index) => {
                    log(`\n${index + 1}. "${frase.texto}"`, 'cyan');
                    log(`   - ${frase.autor || 'Anónimo'}`, 'yellow');
                    log(`   - Categoría: ${frase.categoria_nombre}`, 'blue');
                });
            }
            
        } catch (error) {
            logError(`Error al obtener frases aleatorias: ${error.message}`);
        }

        // Opciones específicas para frases aleatorias
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: '¿Qué deseas hacer ahora?',
                choices: [
                    { name: 'Obtener mas frases aleatorias', value: 'random' },
                    { name: 'Volver al Menu Principal', value: 'main' }
                ],
                default: 'main'
            }
        ]);

        switch (action) {
            case 'random':
                await this.showRandomQuotes();
                break;
            case 'main':
                await this.showMainMenu();
                break;
        }
    }

    /**
     * Actualizar frase
     */
    async updateQuote() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID de la frase a actualizar:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const frase = await Frase.findById(id);
            
            if (!frase) {
                logWarning('Frase no encontrada');
                await this.pauseAndReturn();
                return;
            }

            // Obtener categorías disponibles
            const categorias = await Categoria.findAll(100);

            const answers = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'texto',
                    message: 'Nuevo texto:',
                    default: frase.texto,
                    validate: (input) => input.length >= 10 || 'El texto debe tener al menos 10 caracteres'
                },
                {
                    type: 'input',
                    name: 'autor',
                    message: 'Nuevo autor:',
                    default: frase.autor
                },
                {
                    type: 'list',
                    name: 'categoria_id',
                    message: 'Nueva categoría:',
                    choices: categorias.map(c => ({ name: c.nombre, value: c.id_category })),
                    default: frase.categoria_id
                },
                {
                    type: 'list',
                    name: 'status',
                    message: 'Nuevo estado:',
                    choices: [
                        { name: 'Borrador', value: 'draft' },
                        { name: 'Publicada', value: 'published' },
                        { name: 'Programada', value: 'scheduled' }
                    ],
                    default: frase.status
                }
            ]);

            let scheduled_at = frase.scheduled_at;
            if (answers.status === 'scheduled') {
                const { fecha } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'fecha',
                        message: 'Fecha de publicación programada (YYYY-MM-DD HH:MM):',
                        default: frase.scheduled_at ? new Date(frase.scheduled_at).toISOString().slice(0, 16) : '',
                        validate: (input) => {
                            if (!input) return true;
                            const date = new Date(input);
                            return !isNaN(date.getTime()) && date > new Date() || 'Debe ser una fecha futura válida';
                        }
                    }
                ]);
                scheduled_at = fecha ? new Date(fecha) : null;
            }

            await frase.update({
                texto: answers.texto,
                autor: answers.autor,
                categoria_id: answers.categoria_id,
                status: answers.status,
                scheduled_at: scheduled_at
            });

            logSuccess('Frase actualizada exitosamente');
            
        } catch (error) {
            logError(`Error al actualizar frase: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Publicar frase
     */
    async publishQuote() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID de la frase a publicar:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const frase = await Frase.findById(id);
            
            if (!frase) {
                logWarning('Frase no encontrada');
                await this.pauseAndReturn();
                return;
            }

            await frase.publish();
            logSuccess('Frase publicada exitosamente');
            
        } catch (error) {
            logError(`Error al publicar frase: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Programar frase
     */
    async scheduleQuote() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID de la frase a programar:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const frase = await Frase.findById(id);
            
            if (!frase) {
                logWarning('Frase no encontrada');
                await this.pauseAndReturn();
                return;
            }

            const { fecha } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'fecha',
                    message: 'Fecha de publicación programada (YYYY-MM-DD HH:MM):',
                    validate: (input) => {
                        const date = new Date(input);
                        return !isNaN(date.getTime()) && date > new Date() || 'Debe ser una fecha futura válida';
                    }
                }
            ]);

            await frase.schedule(new Date(fecha));
            logSuccess('Frase programada exitosamente');
            
        } catch (error) {
            logError(`Error al programar frase: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Cambiar frase a borrador
     */
    async draftQuote() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID de la frase a cambiar a borrador:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const frase = await Frase.findById(id);
            
            if (!frase) {
                logWarning('Frase no encontrada');
                await this.pauseAndReturn();
                return;
            }

            await frase.draft();
            logSuccess('Frase cambiada a borrador exitosamente');
            
        } catch (error) {
            logError(`Error al cambiar a borrador: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Eliminar frase
     */
    async deleteQuote() {
        const { id } = await inquirer.prompt([
            {
                type: 'number',
                name: 'id',
                message: 'ID de la frase a eliminar:',
                validate: (input) => input > 0 || 'El ID debe ser un número positivo'
            }
        ]);

        try {
            const frase = await Frase.findById(id);
            
            if (!frase) {
                logWarning('Frase no encontrada');
                await this.pauseAndReturn();
                return;
            }

            const { confirm } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: `¿Estás seguro de eliminar la frase "${frase.texto.substring(0, 50)}..."?`,
                    default: false
                }
            ]);

            if (confirm) {
                const deleted = await frase.delete();
                if (deleted) {
                    logSuccess('Frase eliminada exitosamente');
                } else {
                    logWarning('No se pudo eliminar la frase');
                }
            } else {
                logInfo('Operación cancelada');
            }
            
        } catch (error) {
            logError(`Error al eliminar frase: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Mostrar estadísticas generales
     */
    async showStatistics() {
        logSection('ESTADÍSTICAS GENERALES');
        
        try {
            const [userCount, categoryCount, stats] = await Promise.all([
                Usuario.count(),
                Categoria.count(),
                Frase.getGlobalStats()
            ]);

            console.table([{
                'Total Usuarios': userCount,
                'Total Categorías': categoryCount,
                'Total Frases': stats.total_frases,
                'Frases Publicadas': stats.frases_publicadas,
                'Frases en Borrador': stats.frases_borrador,
                'Frases Programadas': stats.frases_programadas,
                'Usuarios Activos': stats.usuarios_activos,
                'Categorías Usadas': stats.categorias_usadas
            }]);

            // Mostrar estadísticas por categoría
            const categorias = await Categoria.findAll(100);
            if (categorias.length > 0) {
                log('\nEstadísticas por Categoría:', 'cyan');
                const categoriaStats = await Promise.all(
                    categorias.map(async (cat) => {
                        const catStats = await cat.getStats();
                        return {
                            Categoría: cat.nombre,
                            'Total Frases': catStats.total_frases,
                            'Publicadas': catStats.frases_publicadas,
                            'Borrador': catStats.frases_borrador,
                            'Programadas': catStats.frases_programadas
                        };
                    })
                );
                console.table(categoriaStats);
            }
            
        } catch (error) {
            logError(`Error al obtener estadísticas: ${error.message}`);
        }

        // Preguntar si quiere volver al menú principal o ver más estadísticas
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: '¿Qué deseas hacer ahora?',
                choices: [
                    { name: 'Ver estadisticas nuevamente', value: 'stats' },
                    { name: 'Ir a Busquedas Avanzadas', value: 'search' },
                    { name: 'Volver al Menu Principal', value: 'main' }
                ],
                default: 'main'
            }
        ]);

        switch (action) {
            case 'stats':
                await this.showStatistics();
                break;
            case 'search':
                await this.showSearchMenu();
                break;
            case 'main':
                await this.showMainMenu();
                break;
        }
    }

    /**
     * Menú de búsquedas avanzadas
     */
    async showSearchMenu() {
        logSection('BÚSQUEDAS AVANZADAS');
        
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Tipo de búsqueda:',
                choices: [
                    { name: 'Buscar Frases por Texto', value: 'searchQuotes' },
                    { name: 'Buscar Categorias', value: 'searchCategories' },
                    { name: 'Frases por Categoria', value: 'quotesByCategory' },
                    { name: 'Frases por Usuario', value: 'quotesByUser' },
                    { name: 'Volver al Menu Principal', value: 'back' }
                ]
            }
        ]);

        switch (action) {
            case 'searchQuotes':
                await this.searchQuotesByText();
                break;
            case 'searchCategories':
                await this.searchCategories();
                break;
            case 'quotesByCategory':
                await this.showQuotesByCategory();
                break;
            case 'quotesByUser':
                await this.showQuotesByUser();
                break;
            case 'back':
                await this.showMainMenu();
                break;
        }
    }

    /**
     * Buscar frases por texto
     */
    async searchQuotesByText() {
        const { searchTerm } = await inquirer.prompt([
            {
                type: 'input',
                name: 'searchTerm',
                message: 'Término de búsqueda:',
                validate: (input) => input.length > 0 || 'Debe ingresar un término de búsqueda'
            }
        ]);

        try {
            const frases = await Frase.findAll({ search: searchTerm }, 20);
            
            if (frases.length === 0) {
                logWarning(`No se encontraron frases con el término "${searchTerm}"`);
            } else {
                logSection(`RESULTADOS PARA: "${searchTerm}"`);
                console.table(frases.map(f => ({
                    ID: f.id_quote,
                    Texto: f.texto.substring(0, 60) + '...',
                    Autor: f.autor || 'Anónimo',
                    Estado: f.status,
                    Categoría: f.categoria_nombre
                })));
            }
            
        } catch (error) {
            logError(`Error en la búsqueda: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Buscar categorías
     */
    async searchCategories() {
        const { searchTerm } = await inquirer.prompt([
            {
                type: 'input',
                name: 'searchTerm',
                message: 'Término de búsqueda:',
                validate: (input) => input.length > 0 || 'Debe ingresar un término de búsqueda'
            }
        ]);

        try {
            const categorias = await Categoria.search(searchTerm, 20);
            
            if (categorias.length === 0) {
                logWarning(`No se encontraron categorías con el término "${searchTerm}"`);
            } else {
                logSection(`RESULTADOS PARA: "${searchTerm}"`);
                console.table(categorias.map(c => ({
                    ID: c.id_category,
                    Nombre: c.nombre,
                    Descripción: c.descripcion || 'Sin descripción'
                })));
            }
            
        } catch (error) {
            logError(`Error en la búsqueda: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Mostrar frases por categoría
     */
    async showQuotesByCategory() {
        try {
            const categorias = await Categoria.findAll(100);
            
            if (categorias.length === 0) {
                logWarning('No hay categorías disponibles');
                await this.pauseAndReturn();
                return;
            }

            const { categoria_id } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'categoria_id',
                    message: 'Selecciona una categoría:',
                    choices: categorias.map(c => ({ name: c.nombre, value: c.id_category }))
                }
            ]);

            const { limit } = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'limit',
                    message: 'Número de frases a mostrar:',
                    default: 10,
                    validate: (input) => input > 0 || 'Debe ser un número positivo'
                }
            ]);

            const frases = await Frase.findAll({ categoria_id }, limit);
            
            if (frases.length === 0) {
                logWarning('No se encontraron frases en esta categoría');
            } else {
                const categoria = categorias.find(c => c.id_category == categoria_id);
                logSection(`FRASES DE LA CATEGORÍA: ${categoria.nombre.toUpperCase()}`);
                console.table(frases.map(f => ({
                    ID: f.id_quote,
                    Texto: f.texto.substring(0, 60) + '...',
                    Autor: f.autor || 'Anónimo',
                    Estado: f.status,
                    Creador: f.creado_por_nombre
                })));
            }
            
        } catch (error) {
            logError(`Error al obtener frases por categoría: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Mostrar frases por usuario
     */
    async showQuotesByUser() {
        try {
            const usuarios = await Usuario.findAll(100);
            
            if (usuarios.length === 0) {
                logWarning('No hay usuarios disponibles');
                await this.pauseAndReturn();
                return;
            }

            const { creado_por } = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'creado_por',
                    message: 'Selecciona un usuario:',
                    choices: usuarios.map(u => ({ name: u.nombre, value: u.id_user }))
                }
            ]);

            const { limit } = await inquirer.prompt([
                {
                    type: 'number',
                    name: 'limit',
                    message: 'Número de frases a mostrar:',
                    default: 10,
                    validate: (input) => input > 0 || 'Debe ser un número positivo'
                }
            ]);

            const frases = await Frase.findAll({ creado_por }, limit);
            
            if (frases.length === 0) {
                logWarning('No se encontraron frases de este usuario');
            } else {
                const usuario = usuarios.find(u => u.id_user == creado_por);
                logSection(`FRASES DE: ${usuario.nombre.toUpperCase()}`);
                console.table(frases.map(f => ({
                    ID: f.id_quote,
                    Texto: f.texto.substring(0, 60) + '...',
                    Autor: f.autor || 'Anónimo',
                    Estado: f.status,
                    Categoría: f.categoria_nombre
                })));
            }
            
        } catch (error) {
            logError(`Error al obtener frases por usuario: ${error.message}`);
        }

        await this.pauseAndReturn();
    }

    /**
     * Pausa y regresa al menú principal
     */
    async pauseAndReturn() {
        await inquirer.prompt([
            {
                type: 'input',
                name: 'continue',
                message: 'Presiona Enter para regresar al Menú Principal...'
            }
        ]);

        await this.showMainMenu();
    }

    /**
     * Salir de la aplicación
     */
    async exit() {
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: '¿Estás seguro de que deseas salir de la aplicación?',
                default: false
            }
        ]);

        if (confirm) {
            logSection('SALIENDO DE GRATIDAY');
            
            try {
                await this.db.disconnect();
                logSuccess('Conexión a la base de datos cerrada');
            } catch (error) {
                logError(`Error al cerrar conexión: ${error.message}`);
            }
            
            process.exit(0);
        } else {
            logInfo('Operación cancelada. Regresando al menú principal...');
            await this.showMainMenu();
        }
    }
}

// Ejecutar la aplicación si se llama directamente
if (require.main === module) {
    const app = new GratiDayConsole();
    app.start().catch(error => {
        console.error('Error fatal:', error.message);
        process.exit(1);
    });
}

module.exports = GratiDayConsole;
