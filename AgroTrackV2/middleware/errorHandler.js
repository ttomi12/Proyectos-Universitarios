// ========================================
// MIDDLEWARE DE MANEJO CENTRALIZADO DE ERRORES
// ========================================
// Maneja todos los errores de la aplicación de forma centralizada

/**
 * Middleware de manejo de errores
 * Debe ser el último middleware en la cadena
 * @param {Error} err - Objeto de error
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para continuar (no se usa, pero es requerida por Express)
 */
function errorHandler(err, req, res, next) {
    // Log del error en consola
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.originalUrl || req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    
    // Determinar el código de estado HTTP
    const statusCode = err.statusCode || err.status || 500;
    
    // Determinar el mensaje de error
    let message = err.message || 'Error interno del servidor';
    
    // Si es un error de validación, usar mensaje más descriptivo
    if (err.name === 'ValidationError') {
        message = 'Error de validación: ' + message;
    }
    
    // Enviar respuesta JSON con el error
    res.status(statusCode).json({
        error: true,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

module.exports = errorHandler;



