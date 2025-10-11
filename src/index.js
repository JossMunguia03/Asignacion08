/**
 * Archivo principal de la Capa de Acceso a Datos de GratiDay
 * Exporta todas las entidades y la clase Database para uso externo
 */

const Database = require('./database/Database');
const Usuario = require('./models/Usuario');
const Categoria = require('./models/Categoria');
const Frase = require('./models/Frase');

module.exports = {
    Database,
    Usuario,
    Categoria,
    Frase
};
