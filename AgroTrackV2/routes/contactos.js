// ========================================
// RUTAS DE API PARA CONTACTOS
// ========================================
const express = require('express');
const router = express.Router();
const { query } = require('../db');

/**
 * Valida el formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si el email es válido
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida los datos del formulario de contacto
 * @param {Object} data - Datos a validar
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateContactData(data) {
    const errors = [];
    
    // Validar nombre
    if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim().length === 0) {
        errors.push('El campo nombre es requerido');
    } else if (data.nombre.trim().length > 100) {
        errors.push('El nombre no puede exceder 100 caracteres');
    }
    
    // Validar email
    if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
        errors.push('El campo email es requerido');
    } else if (!isValidEmail(data.email.trim())) {
        errors.push('El formato del email no es válido');
    } else if (data.email.trim().length > 255) {
        errors.push('El email no puede exceder 255 caracteres');
    }
    
    // Validar mensaje
    if (!data.mensaje || typeof data.mensaje !== 'string' || data.mensaje.trim().length === 0) {
        errors.push('El campo mensaje es requerido');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * GET /api/contactos
 * Obtiene todos los contactos registrados
 */
async function listContacts(req, res, next) {
    try {
        const sql = 'SELECT id, nombre, email, mensaje, fecha FROM contactos ORDER BY fecha DESC';
        const contactos = await query(sql);
        
        res.json({
            success: true,
            count: contactos.length,
            data: contactos
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/contactos
 * Crea un nuevo contacto
 */
async function createContact(req, res, next) {
    try {
        // Obtener datos del cuerpo de la petición
        const { nombre, email, mensaje } = req.body;
        
        // Validar datos
        const validation = validateContactData({ nombre, email, mensaje });
        
        if (!validation.valid) {
            return res.status(400).json({
                error: true,
                message: 'Error de validación',
                errors: validation.errors
            });
        }
        
        // Normalizar datos (trim y sanitizar)
        const nombreNormalizado = nombre.trim();
        const emailNormalizado = email.trim().toLowerCase();
        const mensajeNormalizado = mensaje.trim();
        
        // Insertar en la base de datos
        const sql = 'INSERT INTO contactos (nombre, email, mensaje) VALUES (?, ?, ?)';
        const result = await query(sql, [nombreNormalizado, emailNormalizado, mensajeNormalizado]);
        
        // Obtener el contacto creado
        const sqlSelect = 'SELECT id, nombre, email, mensaje, fecha FROM contactos WHERE id = ?';
        const [contacto] = await query(sqlSelect, [result.insertId]);
        
        res.status(201).json({
            success: true,
            message: 'Contacto registrado exitosamente',
            data: contacto
        });
    } catch (error) {
        next(error);
    }
}

// Rutas originales
router.get('/', listContacts);
router.post('/', createContact);

// Nuevos alias solicitados
router.get('/listar', listContacts);
router.post('/cargar', createContact);

module.exports = router;



