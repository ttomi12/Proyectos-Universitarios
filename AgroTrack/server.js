// ========================================
// IMPORTACIÓN DE MÓDULOS NATIVOS DE NODE.JS
// ========================================
const http = require('http');    // Módulo para crear servidor HTTP
const fs = require('fs');        // Módulo para operaciones de archivos síncronas
const fsp = fs.promises;         // Módulo para operaciones de archivos asíncronas (promesas)
const path = require('path');    // Módulo para manejo de rutas de archivos
const os = require('os');        // Módulo para operaciones del sistema operativo

// ========================================
// CONFIGURACIÓN DE CONSTANTES
// ========================================
const PORT = 3000;                                           // Puerto donde escuchará el servidor
const PUBLIC_DIR = path.join(__dirname, 'public');          // Directorio con archivos estáticos (HTML, CSS, etc.)
const DATA_DIR = path.join(__dirname, 'data');              // Directorio para guardar datos del sistema
const CONSULTAS_FILE = path.join(DATA_DIR, 'consultas.txt'); // Archivo donde se guardan las consultas de contacto

// ========================================
// CONFIGURACIÓN DE TIPOS MIME
// ========================================
// Mapeo de extensiones de archivo a tipos MIME para que el navegador
// sepa cómo interpretar cada archivo que enviamos
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',              // Páginas HTML
    '.css': 'text/css; charset=utf-8',                // Archivos de estilos CSS
    '.js': 'application/javascript; charset=utf-8',   // Archivos JavaScript
    '.json': 'application/json; charset=utf-8',       // Archivos JSON
    '.png': 'image/png',                              // Imágenes PNG
    '.jpg': 'image/jpeg',                             // Imágenes JPEG
    '.jpeg': 'image/jpeg',                            // Imágenes JPEG (alternativa)
    '.svg': 'image/svg+xml',                          // Imágenes vectoriales SVG
    '.ico': 'image/x-icon',                           // Iconos
    '.txt': 'text/plain; charset=utf-8'               // Archivos de texto plano
};

// ========================================
// FUNCIONES AUXILIARES PARA ENVIAR RESPUESTAS
// ========================================

/**
 * Función genérica para enviar respuesta HTTP con código de estado y tipo de contenido
 * @param {Object} res - Objeto de respuesta HTTP
 * @param {number} statusCode - Código de estado HTTP (200, 404, 500, etc.)
 * @param {string} contentType - Tipo de contenido MIME
 * @param {string} body - Contenido de la respuesta
 */
function send(res, statusCode, contentType, body) {
    res.writeHead(statusCode, { 'Content-Type': contentType });
    res.end(body);
}

/**
 * Función específica para enviar respuestas HTML
 * @param {Object} res - Objeto de respuesta HTTP
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} html - Contenido HTML de la respuesta
 */
function sendHtml(res, statusCode, html) {
    send(res, statusCode, 'text/html; charset=utf-8', html);
}

/**
 * Función para enviar página de error 404 (No encontrado)
 * @param {Object} res - Objeto de respuesta HTTP
 */
function send404(res) {
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>404 - No encontrado</title><link rel="stylesheet" href="/estilos.css"></head><body><div class="container"><main><div class="error-page"><h1>404 - Página no encontrada</h1><p>Lo sentimos, la página que buscas no existe o ha sido movida.</p><div class="error-message">La página solicitada no se encuentra disponible.</div><div class="actions"><a class="btn" href="/">Volver al Inicio</a><a class="btn btn-secondary" href="/productos.html">Ver Productos</a></div></div></main></div></body></html>`;
    sendHtml(res, 404, html);
}

/**
 * Función para enviar página de error 500 (Error interno del servidor)
 * @param {Object} res - Objeto de respuesta HTTP
 * @param {string} message - Mensaje de error opcional
 */
function send500(res, message) {
    const safeMessage = message ? String(message) : 'Error interno del servidor';
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>500 - Error interno</title><link rel="stylesheet" href="/estilos.css"></head><body><div class="container"><main><div class="error-page"><h1>500 - Error interno del servidor</h1><p>Lo sentimos, ha ocurrido un error interno en el servidor.</p><div class="error-message">Error interno del servidor</div><div class="error-description">${safeMessage}</div><div class="actions"><a class="btn" href="/">Volver al Inicio</a><a class="btn btn-secondary" href="/contacto.html">Reportar problema</a></div></div></main></div></body></html>`;
    sendHtml(res, 500, html);
}

// ========================================
// FUNCIONES AUXILIARES PARA MANEJO DE ARCHIVOS Y DATOS
// ========================================

/**
 * Asegura que el directorio 'data' exista para guardar las consultas
 * @returns {Promise} - Promesa que se resuelve cuando el directorio está listo
 */
async function ensureDataDir() {
    try {
        // Crea el directorio 'data' si no existe (recursive: true permite crear subdirectorios)
        await fsp.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
        // Si falla la creación del directorio, lo manejaremos al escribir
        // En un sistema real, podríamos logear este error
    }
}

/**
 * Sirve un archivo estático desde el sistema de archivos
 * @param {Object} res - Objeto de respuesta HTTP
 * @param {string} filePath - Ruta del archivo a servir
 */
async function serveFile(res, filePath) {
    try {
        // Obtiene la extensión del archivo para determinar el tipo MIME
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        
        // Lee el archivo de forma asíncrona
        const data = await fsp.readFile(filePath);
        
        // Envía el archivo con el tipo MIME correcto
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (err) {
        // Si el archivo no existe, devuelve 404
        if (err.code === 'ENOENT') {
            send404(res);
        } else {
            // Para otros errores, devuelve 500
            send500(res, err.message);
        }
    }
}

/**
 * Valida y normaliza una ruta de archivo público para evitar ataques de path traversal
 * @param {string} requestPath - Ruta solicitada por el cliente
 * @returns {string|null} - Ruta segura o null si es inválida
 */
function getSafePublicPath(requestPath) {
    // Remueve parámetros de consulta (todo después de ?)
    const urlPath = requestPath.split('?')[0];
    
    // Normaliza la ruta y remueve barras iniciales
    const normalized = path.normalize(urlPath).replace(/^\\+|^\/+/, '');
    
    // Une con el directorio público
    const resolved = path.join(PUBLIC_DIR, normalized);
    
    // Verifica que la ruta final esté dentro del directorio público (previene path traversal)
    if (!resolved.startsWith(PUBLIC_DIR)) {
        return null; // intento de path traversal
    }
    
    return resolved;
}

/**
 * Parsea el cuerpo de una petición POST de forma asíncrona
 * @param {Object} req - Objeto de petición HTTP
 * @returns {Promise<string>} - Promesa que resuelve con el cuerpo de la petición
 */
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        
        // Acumula los chunks de datos que llegan
        req.on('data', chunk => {
            body += chunk.toString();
            
            // Limitar tamaño básico para evitar abusos en el MVP (1MB)
            if (body.length > 1e6) {
                req.socket.destroy();
                reject(new Error('Payload demasiado grande'));
            }
        });
        
        // Cuando termina la transmisión, resuelve con el cuerpo completo
        req.on('end', () => resolve(body));
        
        // Si hay error en la transmisión, rechaza la promesa
        req.on('error', reject);
    });
}

/**
 * Formatea una fecha en formato YYYY-MM-DD HH:MM para guardar en consultas
 * @param {Date} d - Fecha a formatear
 * @returns {string} - Fecha formateada como string
 */
function formatDate(d) {
    // Función auxiliar para agregar ceros a la izquierda si el número es menor a 10
    // Ejemplo: pad(5) -> "05", pad(12) -> "12"
    const pad = (n) => String(n).padStart(2, '0');
    
    // Obtiene el año completo (4 dígitos)
    const yyyy = d.getFullYear();
    
    // Obtiene el mes (getMonth() devuelve 0-11, por eso sumamos 1 para obtener 1-12)
    const mm = pad(d.getMonth() + 1);
    
    // Obtiene el día del mes (1-31)
    const dd = pad(d.getDate());
    
    // Obtiene la hora en formato 24 horas (0-23)
    const hh = pad(d.getHours());
    
    // Obtiene los minutos (0-59)
    const mi = pad(d.getMinutes());
    
    // Retorna la fecha formateada como "YYYY-MM-DD HH:MM"
    // Ejemplo: "2025-01-15 14:30"
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

// ========================================
// CREACIÓN DEL SERVIDOR HTTP
// ========================================

/**
 * Servidor HTTP principal que maneja todas las peticiones
 * Utiliza async/await para manejar operaciones asíncronas de forma limpia
 */
const server = http.createServer(async (req, res) => {
    try {
        // ========================================
        // PARSEO DE LA URL DE LA PETICIÓN
        // ========================================
        // Crea un objeto URL para poder extraer el pathname (ruta) y parámetros de consulta
        // req.url contiene la ruta completa (ej: "/contacto?nombre=Juan")
        // req.headers.host contiene el host (ej: "localhost:3000")
        const urlObj = new URL(req.url, `http://${req.headers.host}`);
        
        // Extrae solo la ruta sin parámetros de consulta
        // Ejemplo: "/contacto?nombre=Juan" -> "/contacto"
        const pathname = urlObj.pathname;

        // ========================================
        // MANEJO DE PETICIONES GET
        // ========================================
        // Las peticiones GET son para obtener recursos (páginas, archivos, etc.)
        if (req.method === 'GET') {
            
            // ========================================
            // RUTAS PARA PÁGINAS ESTÁTICAS
            // ========================================
            
            // Página principal del portal (acepta tanto "/" como "/index.html")
            if (pathname === '/' || pathname === '/index.html') {
                // Sirve el archivo index.html desde el directorio public
                return serveFile(res, path.join(PUBLIC_DIR, 'index.html'));
            }
            
            // Página de productos agroindustriales
            if (pathname === '/productos.html') {
                // Sirve el archivo productos.html con información de productos
                return serveFile(res, path.join(PUBLIC_DIR, 'productos.html'));
            }
            
            // Página de contacto (acepta tanto "/contacto.html" como "/contacto" para flexibilidad)
            if (pathname === '/contacto.html' || pathname === '/contacto') {
                // Sirve el formulario de contacto
                return serveFile(res, path.join(PUBLIC_DIR, 'contacto.html'));
            }
            
            // Página de login (acepta tanto "/login.html" como "/login" para flexibilidad)
            if (pathname === '/login.html' || pathname === '/login') {
                // Sirve el formulario de login de demostración
                return serveFile(res, path.join(PUBLIC_DIR, 'login.html'));
            }
            
            // ========================================
            // RUTA DINÁMICA: LISTAR CONSULTAS
            // ========================================
            // Endpoint para mostrar todas las consultas guardadas en el sistema
            if (pathname === '/contacto/listar') {
                try {
                    // Intenta leer el archivo de consultas de forma asíncrona
                    // Si el archivo no existe (ENOENT = Error NO ENTry), devuelve string vacío
                    // Si hay otro error, lo relanza para ser manejado por el catch
                    const data = await fsp.readFile(CONSULTAS_FILE, 'utf-8').catch(err => {
                        if (err.code === 'ENOENT') return '';
                        throw err;
                    });
                    
                    // Verifica si el archivo tiene contenido real (no solo espacios en blanco)
                    const hasContent = data && data.trim().length > 0;
                    
                    // IMPORTANTE: Escapa caracteres HTML para prevenir ataques XSS
                    // Convierte < en &lt;, > en &gt;, & en &amp; para que se muestren como texto
                    const escapedData = data.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
                    
                    // Genera HTML dinámico basado en si hay consultas o no
                    // Si hay contenido, lo muestra en un contenedor con scroll
                    // Si no hay contenido, muestra un mensaje informativo
                    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Consultas - AgroTrack</title><link rel="stylesheet" href="/estilos.css"></head><body><div class="container"><main><div class="consultas-page"><h1>Consultas Recibidas</h1><p>Aquí puedes ver todas las consultas que han enviado los usuarios del portal.</p>${hasContent ? `<div class="consultas-content">${escapedData}</div>` : '<div class="no-consultas">Aún no hay consultas registradas en el sistema.</div>'}<div class="actions"><a class="btn" href="/contacto.html">Volver a Contacto</a><a class="btn btn-secondary" href="/">Ir al Inicio</a></div></div></main></div></body></html>`;
                    return sendHtml(res, 200, html);
                } catch (err) {
                    // Si hay cualquier error (lectura de archivo, etc.), devuelve error 500
                    return send500(res, err.message);
                }
            }

            // ========================================
            // SERVIR ARCHIVOS ESTÁTICOS
            // ========================================
            // Si no es ninguna de las rutas anteriores, intenta servir archivos estáticos
            // Esto incluye CSS, imágenes, JavaScript, etc. desde el directorio /public
            
            // Valida la ruta para prevenir ataques de path traversal (../)
            const safePath = getSafePublicPath(pathname);
            if (safePath) {
                // Si la ruta es segura, sirve el archivo estático
                return serveFile(res, safePath);
            }
            
            // ========================================
            // RUTA NO ENCONTRADA (404)
            // ========================================
            // Si llegamos aquí, significa que la ruta no existe
            // Devuelve una página de error 404 personalizada
            return send404(res);
        }

        // ========================================
        // MANEJO DE PETICIONES POST
        // ========================================
        // Las peticiones POST son para enviar datos (formularios, etc.)
        if (req.method === 'POST') {
            
            // ========================================
            // RUTA: LOGIN DE DEMOSTRACIÓN
            // ========================================
            // Endpoint que procesa el formulario de login (sistema de demostración)
            if (pathname === '/auth/recuperar') {
                try {
                    // Parsea el cuerpo de la petición POST de forma asíncrona
                    // El cuerpo contiene los datos del formulario en formato URL-encoded
                    const body = await parseBody(req);
                    
                    // Convierte los datos del formulario en un objeto URLSearchParams
                    // Esto permite extraer fácilmente los valores por nombre de campo
                    const params = new URLSearchParams(body);
                    
                    // Extrae los valores del formulario de login
                    // Si no existen, usa valores por defecto para el sistema de demostración
                    const usuario = params.get('usuario') || '';
                    const clave = params.get('clave') || '';
                    
                    // Genera una página HTML de respuesta mostrando las credenciales ingresadas
                    // Esto es parte del sistema de demostración - en producción sería diferente
                    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Login - Resultado</title><link rel="stylesheet" href="/estilos.css"></head><body><div class="container"><main><div class="login-success"><h1>¡Login Exitoso!</h1><p>Has iniciado sesión correctamente en el sistema AgroTrack.</p><div class="particle">🌟</div><div class="particle">💫</div><div class="credentials"><p><strong>Usuario:</strong> ${usuario || 'Juan'}</p><p><strong>Clave:</strong> ${clave || '1234'}</p></div><div class="actions"><a class="btn" href="/">Ir al Inicio</a><a class="btn btn-secondary" href="/login.html">Volver al Login</a></div></div></main></div></body></html>`;
                    return sendHtml(res, 200, html);
                } catch (err) {
                    // Si hay error al procesar el login, devuelve error 500
                    return send500(res, err.message);
                }
            }

            // ========================================
            // RUTA: PROCESAR FORMULARIO DE CONTACTO
            // ========================================
            // Endpoint que procesa el formulario de contacto y guarda la consulta
            if (pathname === '/contacto/cargar') {
                try {
                    // Parsea el cuerpo de la petición POST de forma asíncrona
                    // El cuerpo contiene los datos del formulario: nombre, email, mensaje
                    const body = await parseBody(req);
                    const params = new URLSearchParams(body);
                    
                    // Extrae los campos del formulario de contacto
                    // Si algún campo está vacío, usa valores por defecto para evitar errores
                    const nombre = params.get('nombre') || 'Sin nombre';
                    const email = params.get('email') || 'sin-email';
                    const mensaje = params.get('mensaje') || '';

                    // Asegura que el directorio 'data' exista antes de escribir el archivo
                    // Si no existe, lo crea automáticamente
                    await ensureDataDir();

                    // Crea la entrada con el formato específico solicitado en los requisitos
                    // Formato: separadores con guiones, fecha, datos del usuario
                    const now = new Date();
                    const entrada = [
                        '-------------------------',           // Separador superior
                        `Fecha: ${formatDate(now)}`,         // Fecha y hora actual
                        `Nombre: ${nombre}`,                 // Nombre del usuario
                        `Email: ${email}`,                   // Email del usuario
                        `Mensaje: ${mensaje}`,               // Mensaje de la consulta
                        '-------------------------'           // Separador inferior
                    ].join(os.EOL) + os.EOL;                  // Une con saltos de línea del SO + salto final

                    // Guarda la consulta en el archivo usando appendFile
                    // appendFile añade al final del archivo sin sobrescribir el contenido existente
                    await fsp.appendFile(CONSULTAS_FILE, entrada, 'utf-8');

                    // Responde con una página de agradecimiento personalizada
                    // Incluye efectos visuales y opciones de navegación
                    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Contacto - Gracias</title><link rel="stylesheet" href="/estilos.css"></head><body><div class="container"><main><div class="success-page"><h1>¡Gracias por tu consulta!</h1><p>Hemos recibido tu mensaje correctamente y será procesado por nuestro equipo.</p><div class="confetti">🎈</div><div class="confetti">🎁</div><div class="thanks-message"><p><strong>Tu consulta ha sido registrada exitosamente.</strong><br>Nos pondremos en contacto contigo pronto.</p></div><div class="actions"><a class="btn" href="/contacto.html">Enviar otra consulta</a><a class="btn btn-secondary" href="/contacto/listar">Ver todas las consultas</a><a class="btn btn-secondary" href="/">Ir al Inicio</a></div></div></main></div></body></html>`;
                    return sendHtml(res, 200, html);
                } catch (err) {
                    // Si hay error al procesar el formulario (crear directorio, escribir archivo, etc.)
                    return send500(res, err.message);
                }
            }

            // ========================================
            // RUTA POST NO ENCONTRADA
            // ========================================
            // Si se hace POST a una ruta que no existe, devolver 404
            return send404(res);
        }

        // ========================================
        // MANEJO DE MÉTODOS HTTP NO SOPORTADOS
        // ========================================
        // Si el método HTTP no es GET ni POST (ej: PUT, DELETE, PATCH, etc.)
        // Devuelve código 405 (Method Not Allowed) con mensaje explicativo
        res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Método no permitido');
        
    } catch (err) {
        // ========================================
        // MANEJO GLOBAL DE ERRORES
        // ========================================
        // Si ocurre cualquier error no manejado específicamente arriba
        // (errores de parsing, errores de red, etc.), devuelve error 500
        // Esto asegura que el servidor nunca se caiga inesperadamente
        send500(res, err.message);
    }
});

// ========================================
// INICIO DEL SERVIDOR
// ========================================

/**
 * Inicia el servidor HTTP y lo pone a escuchar en el puerto configurado
 * Una vez iniciado, el servidor estará disponible para recibir peticiones
 */
server.listen(PORT, () => {
    // Muestra mensaje de confirmación en la consola
    console.log(`Servidor AgroTrack escuchando en http://localhost:${PORT}`);
});


