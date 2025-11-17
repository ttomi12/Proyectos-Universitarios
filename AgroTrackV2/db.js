// ========================================
// CONFIGURACIÓN DE CONEXIÓN A BASE DE DATOS MYSQL
// ========================================
const mysql = require('mysql2/promise');
const contactosSeedData = require('./seed/contactosSeedData');

// Configuración de la conexión usando variables de entorno
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'tomasbosco12',
    database: process.env.DB_NAME || 'agrotrack',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

/**
 * Prueba la conexión a la base de datos
 * @returns {Promise<boolean>} - true si la conexión es exitosa
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        console.log('✅ Conexión a MySQL establecida correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con MySQL:', error.message);
        return false;
    }
}

/**
 * Ejecuta una consulta SQL
 * @param {string} query - Consulta SQL
 * @param {Array} params - Parámetros para la consulta
 * @returns {Promise} - Resultado de la consulta
 */
async function query(sql, params) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Error en consulta SQL:', error.message);
        throw error;
    }
}

/**
 * Inserta datos de ejemplo si la tabla contactos tiene menos de minRows registros
 * @param {number} minRows - Mínimo de filas deseado
 */
async function seedContactsIfNeeded(minRows = 20, maxRows = 100) {
    try {
        if (minRows > maxRows) {
            minRows = maxRows;
        }

        const [{ total }] = await query('SELECT COUNT(*) AS total FROM contactos');

        if (total >= maxRows) {
            console.log(`ℹ️  La tabla contactos ya tiene ${total} registros (máximo permitido ${maxRows}). No se agregan datos de demostración.`);
            return false;
        }

        if (total >= minRows) {
            return false;
        }

        const needed = Math.min(minRows - total, maxRows - total);
        const inserts = [];

        for (let i = 0; i < needed; i++) {
            const seed = contactosSeedData[i % contactosSeedData.length];
            const sufijo = total + i + 1;
            inserts.push({
                nombre: `${seed.nombre} ${sufijo}`,
                email: seed.email.replace('@', `+${sufijo}@`),
                mensaje: seed.mensaje
            });
        }

        for (const item of inserts) {
            await query(
                'INSERT INTO contactos (nombre, email, mensaje) VALUES (?, ?, ?)',
                [item.nombre, item.email, item.mensaje]
            );
        }

        console.log(`✅ Se agregaron ${needed} contactos de demostración (total actual aproximado: ${total + needed}).`);
        return true;

    } catch (error) {
        console.error('Error al sembrar datos de contactos:', error.message);
        return false;
    }
}

module.exports = {
    pool,
    testConnection,
    query,
    seedContactsIfNeeded
};



