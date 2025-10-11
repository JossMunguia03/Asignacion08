const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Clase para gestionar la conexión a la base de datos MySQL
 * Implementa el patrón Singleton para asegurar una única conexión
 */
class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        this.connection = null;
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'gratiday',
            charset: process.env.DB_CHARSET || 'utf8mb4',
            timezone: '+00:00'
        };

        Database.instance = this;
    }

    /**
     * Establece la conexión a la base de datos
     * @returns {Promise<void>}
     */
    async connect() {
        try {
            if (!this.connection) {
                this.connection = await mysql.createConnection(this.config);
                console.log('Conexión a la base de datos establecida exitosamente');
            }
        } catch (error) {
            console.error('Error al conectar con la base de datos:', error.message);
            throw error;
        }
    }

    /**
     * Cierra la conexión a la base de datos
     * @returns {Promise<void>}
     */
    async disconnect() {
        try {
            if (this.connection) {
                await this.connection.end();
                this.connection = null;
                console.log('Conexión a la base de datos cerrada');
            }
        } catch (error) {
            console.error('Error al cerrar la conexión:', error.message);
            throw error;
        }
    }

    /**
     * Ejecuta una consulta SQL
     * @param {string} query - Consulta SQL
     * @param {Array} params - Parámetros para la consulta
     * @returns {Promise<Object>} - Resultado de la consulta
     */
    async query(query, params = []) {
        try {
            if (!this.connection) {
                await this.connect();
            }

            const [rows] = await this.connection.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error en la consulta SQL:', error.message);
            console.error('Query:', query);
            console.error('Parámetros:', params);
            throw error;
        }
    }

    /**
     * Inicia una transacción
     * @returns {Promise<void>}
     */
    async beginTransaction() {
        if (!this.connection) {
            await this.connect();
        }
        await this.connection.beginTransaction();
    }

    /**
     * Confirma una transacción
     * @returns {Promise<void>}
     */
    async commit() {
        if (this.connection) {
            await this.connection.commit();
        }
    }

    /**
     * Revierte una transacción
     * @returns {Promise<void>}
     */
    async rollback() {
        if (this.connection) {
            await this.connection.rollback();
        }
    }

    /**
     * Verifica si la conexión está activa
     * @returns {boolean}
     */
    isConnected() {
        return this.connection !== null;
    }

    /**
     * Obtiene el ID del último registro insertado
     * @returns {Promise<number>}
     */
    async getLastInsertId() {
        if (!this.connection) {
            throw new Error('No hay conexión activa');
        }
        const [result] = await this.connection.execute('SELECT LAST_INSERT_ID() as id');
        return result[0].id;
    }
}

module.exports = Database;
