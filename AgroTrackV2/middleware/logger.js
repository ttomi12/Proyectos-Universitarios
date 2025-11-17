// ========================================
// MIDDLEWARE DE LOGGER
// ========================================
// Registra todas las peticiones HTTP que llegan al servidor

/**
 * Middleware de logging que registra información de cada petición
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para continuar con el siguiente middleware
 */
function logger(req, res, next) {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const ip = req.ip || req.connection.remoteAddress;
    
    // Registra la petición en consola
    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
    
    // Continúa con el siguiente middleware
    next();
}

module.exports = logger;



