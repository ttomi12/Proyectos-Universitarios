// Script de prueba para verificar el funcionamiento del servidor AgroTrack
const http = require('http');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Función para hacer peticiones HTTP
function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data ? Buffer.byteLength(data) : 0
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(data);
        }
        req.end();
    });
}

// Función para probar endpoints
async function runTests() {
    console.log('🧪 Iniciando pruebas del servidor AgroTrack...\n');

    const tests = [
        {
            name: 'Página principal (/)',
            test: () => makeRequest('/'),
            expectedStatus: 200
        },
        {
            name: 'Página de productos',
            test: () => makeRequest('/productos.html'),
            expectedStatus: 200
        },
        {
            name: 'Página de contacto',
            test: () => makeRequest('/contacto.html'),
            expectedStatus: 200
        },
        {
            name: 'Página de login',
            test: () => makeRequest('/login.html'),
            expectedStatus: 200
        },
        {
            name: 'Archivo CSS',
            test: () => makeRequest('/estilos.css'),
            expectedStatus: 200
        },
        {
            name: 'Login de demostración (GET)',
            test: () => makeRequest('/login'),
            expectedStatus: 200
        },
        {
            name: 'Login de demostración (POST)',
            test: () => makeRequest('/auth/recuperar', 'POST', 'usuario=Juan&clave=1234'),
            expectedStatus: 200
        },
        {
            name: 'Formulario de contacto (GET)',
            test: () => makeRequest('/contacto'),
            expectedStatus: 200
        },
        {
            name: 'Enviar consulta de contacto',
            test: () => makeRequest('/contacto/cargar', 'POST', 'nombre=Test&email=test@test.com&mensaje=Prueba del sistema'),
            expectedStatus: 200
        },
        {
            name: 'Listar consultas',
            test: () => makeRequest('/contacto/listar'),
            expectedStatus: 200
        },
        {
            name: 'Página no encontrada (404)',
            test: () => makeRequest('/pagina-inexistente'),
            expectedStatus: 404
        }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            console.log(`🔍 Probando: ${test.name}`);
            const result = await test.test();
            
            if (result.statusCode === test.expectedStatus) {
                console.log(`✅ ${test.name} - OK (${result.statusCode})`);
                passed++;
            } else {
                console.log(`❌ ${test.name} - FALLO (esperado: ${test.expectedStatus}, obtenido: ${result.statusCode})`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name} - ERROR: ${error.message}`);
            failed++;
        }
        console.log('');
    }

    console.log('📊 Resumen de pruebas:');
    console.log(`✅ Exitosas: ${passed}`);
    console.log(`❌ Fallidas: ${failed}`);
    console.log(`📈 Total: ${passed + failed}`);

    if (failed === 0) {
        console.log('\n🎉 ¡Todas las pruebas pasaron! El servidor está funcionando correctamente.');
    } else {
        console.log('\n⚠️  Algunas pruebas fallaron. Revisa el servidor.');
    }
}

// Verificar si el servidor está ejecutándose
async function checkServer() {
    try {
        await makeRequest('/');
        console.log('✅ Servidor detectado en http://localhost:3000');
        return true;
    } catch (error) {
        console.log('❌ No se puede conectar al servidor en http://localhost:3000');
        console.log('💡 Asegúrate de que el servidor esté ejecutándose con: node server.js');
        return false;
    }
}

// Función principal
async function main() {
    console.log('🚀 Pruebas del Portal AgroTrack\n');
    
    const serverRunning = await checkServer();
    if (!serverRunning) {
        process.exit(1);
    }
    
    console.log('');
    await runTests();
}

// Ejecutar pruebas
main().catch(console.error);

