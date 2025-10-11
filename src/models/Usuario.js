const Database = require('../database/Database');
const crypto = require('crypto');

/**
 * Clase que representa la entidad Usuario
 * Maneja todas las operaciones CRUD relacionadas con los usuarios
 */
class Usuario {
    constructor(data = {}) {
        this.id_user = data.id_user || null;
        this.nombre = data.nombre || '';
        this.correo_electronico = data.correo_electronico || '';
        this.password_hash = data.password_hash || '';
        this.fecha_creacion = data.fecha_creacion || null;
        this.rol = data.rol || 'user';
    }

    /**
     * Crea un hash seguro de la contraseña
     * @param {string} password - Contraseña en texto plano
     * @returns {string} - Hash de la contraseña
     */
    static hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return salt + ':' + hash;
    }

    /**
     * Verifica si una contraseña coincide con el hash almacenado
     * @param {string} password - Contraseña en texto plano
     * @param {string} hash - Hash almacenado
     * @returns {boolean} - True si la contraseña es correcta
     */
    static verifyPassword(password, hash) {
        const [salt, originalHash] = hash.split(':');
        const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return originalHash === verifyHash;
    }

    /**
     * Valida los datos del usuario antes de guardar
     * @returns {Object} - Objeto con isValid y errors
     */
    validate() {
        const errors = [];

        if (!this.nombre || this.nombre.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (!this.correo_electronico || !this.isValidEmail(this.correo_electronico)) {
            errors.push('El correo electrónico no es válido');
        }

        if (!this.password_hash || this.password_hash.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }

        if (!['admin', 'user'].includes(this.rol)) {
            errors.push('El rol debe ser "admin" o "user"');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Valida formato de email
     * @param {string} email - Email a validar
     * @returns {boolean} - True si el email es válido
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Crea un nuevo usuario en la base de datos
     * @param {string} password - Contraseña en texto plano
     * @returns {Promise<Usuario>} - Usuario creado con ID asignado
     */
    async create(password) {
        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
        }

        // Crear hash de la contraseña
        this.password_hash = Usuario.hashPassword(password);

        const db = new Database();
        const query = `
            INSERT INTO usuario (nombre, correo_electronico, password_hash, rol)
            VALUES (?, ?, ?, ?)
        `;
        
        try {
            await db.query(query, [
                this.nombre,
                this.correo_electronico,
                this.password_hash,
                this.rol
            ]);

            this.id_user = await db.getLastInsertId();
            this.fecha_creacion = new Date();
            
            return this;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('El correo electrónico ya está registrado');
            }
            throw error;
        }
    }

    /**
     * Busca un usuario por ID
     * @param {number} id - ID del usuario
     * @returns {Promise<Usuario|null>} - Usuario encontrado o null
     */
    static async findById(id) {
        const db = new Database();
        const query = 'SELECT * FROM usuario WHERE id_user = ?';
        
        try {
            const results = await db.query(query, [id]);
            if (results.length === 0) {
                return null;
            }
            
            return new Usuario(results[0]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Busca un usuario por correo electrónico
     * @param {string} email - Correo electrónico del usuario
     * @returns {Promise<Usuario|null>} - Usuario encontrado o null
     */
    static async findByEmail(email) {
        const db = new Database();
        const query = 'SELECT * FROM usuario WHERE correo_electronico = ?';
        
        try {
            const results = await db.query(query, [email]);
            if (results.length === 0) {
                return null;
            }
            
            return new Usuario(results[0]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtiene todos los usuarios
     * @param {number} limit - Límite de resultados
     * @param {number} offset - Desplazamiento para paginación
     * @returns {Promise<Array<Usuario>>} - Lista de usuarios
     */
    static async findAll(limit = 50, offset = 0) {
        const db = new Database();
        const query = 'SELECT * FROM usuario ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?';
        
        try {
            const results = await db.query(query, [limit, offset]);
            return results.map(row => new Usuario(row));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualiza los datos del usuario
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Usuario>} - Usuario actualizado
     */
    async update(updateData = {}) {
        if (this.id_user === null) {
            throw new Error('No se puede actualizar un usuario sin ID');
        }

        // Actualizar propiedades del objeto
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined && key !== 'id_user') {
                this[key] = updateData[key];
            }
        });

        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
        }

        const db = new Database();
        const query = `
            UPDATE usuario 
            SET nombre = ?, correo_electronico = ?, rol = ?
            WHERE id_user = ?
        `;
        
        try {
            await db.query(query, [
                this.nombre,
                this.correo_electronico,
                this.rol,
                this.id_user
            ]);
            
            return this;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('El correo electrónico ya está registrado');
            }
            throw error;
        }
    }

    /**
     * Actualiza la contraseña del usuario
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise<Usuario>} - Usuario actualizado
     */
    async updatePassword(newPassword) {
        if (this.id_user === null) {
            throw new Error('No se puede actualizar la contraseña de un usuario sin ID');
        }

        if (!newPassword || newPassword.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        const db = new Database();
        const hashedPassword = Usuario.hashPassword(newPassword);
        
        const query = 'UPDATE usuario SET password_hash = ? WHERE id_user = ?';
        
        try {
            await db.query(query, [hashedPassword, this.id_user]);
            this.password_hash = hashedPassword;
            
            return this;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Elimina el usuario de la base de datos
     * @returns {Promise<boolean>} - True si se eliminó correctamente
     */
    async delete() {
        if (this.id_user === null) {
            throw new Error('No se puede eliminar un usuario sin ID');
        }

        const db = new Database();
        const query = 'DELETE FROM usuario WHERE id_user = ?';
        
        try {
            const result = await db.query(query, [this.id_user]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Autentica un usuario con email y contraseña
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña en texto plano
     * @returns {Promise<Usuario|null>} - Usuario autenticado o null
     */
    static async authenticate(email, password) {
        try {
            const usuario = await Usuario.findByEmail(email);
            if (!usuario) {
                return null;
            }

            if (Usuario.verifyPassword(password, usuario.password_hash)) {
                return usuario;
            }

            return null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Convierte el usuario a un objeto plano sin información sensible
     * @returns {Object} - Objeto sin password_hash
     */
    toJSON() {
        return {
            id_user: this.id_user,
            nombre: this.nombre,
            correo_electronico: this.correo_electronico,
            fecha_creacion: this.fecha_creacion,
            rol: this.rol
        };
    }

    /**
     * Obtiene el conteo total de usuarios
     * @returns {Promise<number>} - Número total de usuarios
     */
    static async count() {
        const db = new Database();
        const query = 'SELECT COUNT(*) as total FROM usuario';
        
        try {
            const results = await db.query(query);
            return results[0].total;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Usuario;
