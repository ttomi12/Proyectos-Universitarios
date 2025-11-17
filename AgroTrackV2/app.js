// ========================================
// SERVIDOR EXPRESS - AGROTRACK V 2.0
// ========================================
require('dotenv').config();
const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const contactosRouter = require('./routes/contactos');
const { testConnection, seedContactsIfNeeded } = require('./db');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE GLOBAL
// ========================================

// Middleware de logging
app.use(logger);

// Middleware para parsear JSON en el cuerpo de las peticiones
app.use(express.json());

// Middleware para parsear datos de formularios (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde el directorio /public
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// RUTAS
// ========================================

function escapeHtml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
/**
 * GET /
 * Página principal del portal
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * GET /health
 * Endpoint de verificación del estado del servidor
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// ========================================
// API REST
// ========================================

// Rutas de la API de contactos
app.use('/api/contactos', contactosRouter);

/**
 * POST /auth/recuperar
 * Endpoint de demostración para el formulario de login
 */
app.post('/auth/recuperar', (req, res) => {
    const usuario = escapeHtml(req.body?.usuario || 'Usuario demo');
    const clave = escapeHtml(req.body?.clave || '1234');

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - Resultado</title>
        <link rel="stylesheet" href="/estilos.css">
    </head>
    <body>
        <div class="container">
            <header>
                <h1>AgroTrack</h1>
                <p class="subtitle">Portal Interno Agroindustrial</p>
                <nav>
                    <a href="/">Inicio</a>
                    <a href="/productos.html">Productos</a>
                    <a href="/contacto.html">Contacto</a>
                    <a href="/login.html" class="active">Login</a>
                </nav>
            </header>
            <main>
                <section class="page-header">
                    <h2>¡Inicio de sesión exitoso!</h2>
                    <p>¡Bienvenido a AgroTrack!</p>
                </section>
                <section class="login-success">
                    <div class="success-card">
                        <p><strong>Usuario:</strong> ${usuario}</p>
                        <p><strong>Clave:</strong> ${clave}</p>
                        <div class="action-buttons">
                            <a href="/" class="btn">Ir al inicio</a>
                            <a href="/login.html" class="btn btn-secondary">Volver al login</a>
                        </div>
                    </div>
                </section>
            </main>
            <footer>
                <p>&copy; 2025 AgroTrack. Portal Interno - Todos los derechos reservados.</p>
            </footer>
        </div>
    </body>
    </html>
    `;

    res.send(html);
});

// ========================================
// MANEJO DE ERRORES
// ========================================

// Middleware de manejo de errores (debe ser el último)
app.use(errorHandler);

// ========================================
// INICIO DEL SERVIDOR
// ========================================

/**
 * Inicia el servidor y prueba la conexión a la base de datos
 */
async function startServer() {
    try {
        // Probar conexión a la base de datos
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.warn('⚠️  Advertencia: No se pudo conectar a la base de datos. Algunas funcionalidades pueden no estar disponibles.');
        } else {
            await seedContactsIfNeeded(20, 100);
            console.log('📦 Datos de contactos listos (mínimo 20, máximo 100).');
        }
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor AgroTrack V 2.0 escuchando en http://localhost:${PORT}`);
            console.log(`📊 Health check disponible en http://localhost:${PORT}/health`);
            console.log(`📝 API de contactos disponible en http://localhost:${PORT}/api/contactos`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
}

// Iniciar el servidor
startServer();



