const Database = require('../database/Database');

/**
 * Clase que representa la entidad Categoria
 * Maneja todas las operaciones CRUD relacionadas con las categorías de frases
 */
class Categoria {
    constructor(data = {}) {
        this.id_category = data.id_category || null;
        this.nombre = data.nombre || '';
        this.descripcion = data.descripcion || '';
    }

    /**
     * Valida los datos de la categoría antes de guardar
     * @returns {Object} - Objeto con isValid y errors
     */
    validate() {
        const errors = [];

        if (!this.nombre || this.nombre.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (this.nombre && this.nombre.length > 80) {
            errors.push('El nombre no puede exceder 80 caracteres');
        }

        if (this.descripcion && this.descripcion.length > 255) {
            errors.push('La descripción no puede exceder 255 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Crea una nueva categoría en la base de datos
     * @returns {Promise<Categoria>} - Categoría creada con ID asignado
     */
    async create() {
        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
        }

        const db = new Database();
        const query = `
            INSERT INTO categoria (nombre, descripcion)
            VALUES (?, ?)
        `;
        
        try {
            await db.query(query, [this.nombre, this.descripcion]);
            this.id_category = await db.getLastInsertId();
            
            return this;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Ya existe una categoría con ese nombre');
            }
            throw error;
        }
    }

    /**
     * Busca una categoría por ID
     * @param {number} id - ID de la categoría
     * @returns {Promise<Categoria|null>} - Categoría encontrada o null
     */
    static async findById(id) {
        const db = new Database();
        const query = 'SELECT * FROM categoria WHERE id_category = ?';
        
        try {
            const results = await db.query(query, [id]);
            if (results.length === 0) {
                return null;
            }
            
            return new Categoria(results[0]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Busca una categoría por nombre
     * @param {string} nombre - Nombre de la categoría
     * @returns {Promise<Categoria|null>} - Categoría encontrada o null
     */
    static async findByNombre(nombre) {
        const db = new Database();
        const query = 'SELECT * FROM categoria WHERE nombre = ?';
        
        try {
            const results = await db.query(query, [nombre]);
            if (results.length === 0) {
                return null;
            }
            
            return new Categoria(results[0]);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtiene todas las categorías
     * @param {number} limit - Límite de resultados
     * @param {number} offset - Desplazamiento para paginación
     * @returns {Promise<Array<Categoria>>} - Lista de categorías
     */
    static async findAll(limit = 50, offset = 0) {
        const db = new Database();
        const query = 'SELECT * FROM categoria ORDER BY nombre ASC LIMIT ? OFFSET ?';
        
        try {
            const results = await db.query(query, [limit, offset]);
            return results.map(row => new Categoria(row));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Busca categorías por término de búsqueda
     * @param {string} searchTerm - Término de búsqueda
     * @param {number} limit - Límite de resultados
     * @param {number} offset - Desplazamiento para paginación
     * @returns {Promise<Array<Categoria>>} - Lista de categorías encontradas
     */
    static async search(searchTerm, limit = 50, offset = 0) {
        const db = new Database();
        const query = `
            SELECT * FROM categoria 
            WHERE nombre LIKE ? OR descripcion LIKE ?
            ORDER BY nombre ASC 
            LIMIT ? OFFSET ?
        `;
        
        const searchPattern = `%${searchTerm}%`;
        
        try {
            const results = await db.query(query, [searchPattern, searchPattern, limit, offset]);
            return results.map(row => new Categoria(row));
        } catch (error) {
            throw error;
        }
    }

    /**
     * Actualiza los datos de la categoría
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Categoria>} - Categoría actualizada
     */
    async update(updateData = {}) {
        if (this.id_category === null) {
            throw new Error('No se puede actualizar una categoría sin ID');
        }

        // Actualizar propiedades del objeto
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined && key !== 'id_category') {
                this[key] = updateData[key];
            }
        });

        const validation = this.validate();
        if (!validation.isValid) {
            throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
        }

        const db = new Database();
        const query = `
            UPDATE categoria 
            SET nombre = ?, descripcion = ?
            WHERE id_category = ?
        `;
        
        try {
            await db.query(query, [this.nombre, this.descripcion, this.id_category]);
            return this;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Ya existe una categoría con ese nombre');
            }
            throw error;
        }
    }

    /**
     * Elimina la categoría de la base de datos
     * @param {boolean} forceDelete - Si true, elimina aunque tenga frases asociadas
     * @returns {Promise<boolean>} - True si se eliminó correctamente
     */
    async delete(forceDelete = false) {
        if (this.id_category === null) {
            throw new Error('No se puede eliminar una categoría sin ID');
        }

        const db = new Database();
        
        // Verificar si la categoría tiene frases asociadas
        if (!forceDelete) {
            const countQuery = 'SELECT COUNT(*) as count FROM frase WHERE categoria_id = ?';
            const countResult = await db.query(countQuery, [this.id_category]);
            
            if (countResult[0].count > 0) {
                throw new Error('No se puede eliminar la categoría porque tiene frases asociadas');
            }
        }

        const query = 'DELETE FROM categoria WHERE id_category = ?';
        
        try {
            const result = await db.query(query, [this.id_category]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtiene el conteo total de categorías
     * @returns {Promise<number>} - Número total de categorías
     */
    static async count() {
        const db = new Database();
        const query = 'SELECT COUNT(*) as total FROM categoria';
        
        try {
            const results = await db.query(query);
            return results[0].total;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtiene el conteo de frases asociadas a esta categoría
     * @returns {Promise<number>} - Número de frases en esta categoría
     */
    async getFrasesCount() {
        if (this.id_category === null) {
            throw new Error('No se puede obtener el conteo de frases sin ID de categoría');
        }

        const db = new Database();
        const query = 'SELECT COUNT(*) as total FROM frase WHERE categoria_id = ?';
        
        try {
            const results = await db.query(query, [this.id_category]);
            return results[0].total;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtiene todas las frases de esta categoría
     * @param {number} limit - Límite de resultados
     * @param {number} offset - Desplazamiento para paginación
     * @returns {Promise<Array>} - Lista de frases
     */
    async getFrases(limit = 50, offset = 0) {
        if (this.id_category === null) {
            throw new Error('No se puede obtener las frases sin ID de categoría');
        }

        const db = new Database();
        const query = `
            SELECT f.*, u.nombre as creado_por_nombre, c.nombre as categoria_nombre
            FROM frase f
            JOIN usuario u ON f.creado_por = u.id_user
            JOIN categoria c ON f.categoria_id = c.id_category
            WHERE f.categoria_id = ?
            ORDER BY f.fecha_creacion DESC
            LIMIT ? OFFSET ?
        `;
        
        try {
            const results = await db.query(query, [this.id_category, limit, offset]);
            return results;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtiene estadísticas de la categoría
     * @returns {Promise<Object>} - Estadísticas de la categoría
     */
    async getStats() {
        if (this.id_category === null) {
            throw new Error('No se puede obtener estadísticas sin ID de categoría');
        }

        const db = new Database();
        const query = `
            SELECT 
                COUNT(*) as total_frases,
                COUNT(CASE WHEN status = 'published' THEN 1 END) as frases_publicadas,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as frases_borrador,
                COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as frases_programadas
            FROM frase 
            WHERE categoria_id = ?
        `;
        
        try {
            const results = await db.query(query, [this.id_category]);
            return results[0];
        } catch (error) {
            throw error;
        }
    }

    /**
     * Convierte la categoría a un objeto plano
     * @returns {Object} - Objeto con los datos de la categoría
     */
    toJSON() {
        return {
            id_category: this.id_category,
            nombre: this.nombre,
            descripcion: this.descripcion
        };
    }
}

module.exports = Categoria;
