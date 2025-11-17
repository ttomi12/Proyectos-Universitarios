# AgroTrack - Portal Interno V 2.0
**Tomas Bosco - Comisión A**

Portal web interno para la empresa agroindustrial AgroTrack, desarrollado con Express y MySQL.

## 📋 Descripción

AgroTrack V 2.0 es la evolución del portal interno que permite al personal de la empresa:
- Consultar información básica sobre productos y servicios
- Registrar y consultar contactos mediante una API REST
- Almacenar datos de forma persistente en base de datos MySQL

## 🚀 Características

- **Servidor Express** con configuración moderna
- **API REST** para gestión de contactos (GET y POST)
- **Base de datos MySQL** para persistencia de datos
- **Middleware personalizado** para logging y manejo de errores
- **Validaciones** completas de datos de entrada
- **Manejo centralizado de errores** con códigos HTTP apropiados
- **Configuración mediante variables de entorno** (.env)
- **Interfaz moderna** y responsive

## 🛠️ Tecnologías Utilizadas

- **Node.js** (versión 14 o superior)
- **Express.js** - Framework web para Node.js
- **MySQL2** - Cliente MySQL con soporte para promesas
- **dotenv** - Gestión de variables de entorno
- **HTML5** semántico
- **CSS3** con diseño responsive

## 📁 Estructura del Proyecto

```
agrotrack/
├── app.js                  # Servidor Express principal
├── db.js                   # Configuración de conexión a MySQL
├── package.json            # Dependencias del proyecto
├── routes/
│   └── contactos.js        # Rutas de la API de contactos
├── middleware/
│   ├── logger.js           # Middleware de logging
│   └── errorHandler.js     # Middleware de manejo de errores
├── public/                 # Archivos estáticos
│   ├── index.html          # Página principal
│   ├── productos.html      # Información de productos
│   ├── contacto.html       # Formulario de contacto
│   ├── login.html          # Formulario de login
│   ├── estilos.css         # Estilos CSS
│   └── agrotrack-logo.svg  # Logo de la empresa
├── sql/
│   └── schema.sql          # Script de creación de base de datos
├── .env                    # Variables de entorno (no versionado)
├── .env.example            # Ejemplo de variables de entorno
├── .gitignore              # Archivos a ignorar en Git
└── README.md               # Este archivo
```

## 🚀 Instalación y Uso

### Prerrequisitos

- **Node.js** (versión 14 o superior)
- **MySQL** (versión 5.7 o superior, o MariaDB 10.2+)
- **npm** (incluido con Node.js)

### Pasos para ejecutar

1. **Clonar o descargar el proyecto**
   ```bash
   git clone <url-del-repositorio>
   cd agrotrack
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   
   a. Crear la base de datos ejecutando el script SQL:
   ```bash
   mysql -u root -p < sql/schema.sql
   ```
   
   O ejecutar manualmente en MySQL:
   ```sql
   CREATE DATABASE IF NOT EXISTS agrotrack;
   USE agrotrack;
   -- Ver sql/schema.sql para el script completo
   ```

4. **Configurar variables de entorno**
   
   Copiar el archivo de ejemplo y completar con tus credenciales:
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` con tus datos:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=agrotrack
   NODE_ENV=development
   ```

5. **Ejecutar el servidor**
   ```bash
   npm start
   ```
   
   O en modo desarrollo:
   ```bash
   npm run dev
   ```

6. **Verificar que el servidor está funcionando**
   
   Abrir en el navegador:
   ```
   http://localhost:3000
   ```
   
   O verificar el health check:
   ```
   http://localhost:3000/health
   ```

## 📖 Endpoints Disponibles

### Páginas Estáticas

- `GET /` - Página principal del portal
- `GET /productos.html` - Información de productos
- `GET /contacto.html` - Formulario de contacto
- `GET /login.html` - Formulario de login
- `GET /estilos.css` - Archivo de estilos
- `GET /agrotrack-logo.svg` - Logo de la empresa

### Health Check

- `GET /health` - Verificación del estado del servidor
  - **Respuesta exitosa (200):**
    ```json
    {
      "status": "ok",
      "timestamp": "2025-01-15T10:30:00.000Z",
      "uptime": 123.456
    }
    ```

### API REST de Contactos

#### GET /api/contactos

Obtiene todos los contactos registrados.

- **Método:** GET
- **URL:** `http://localhost:3000/api/contactos`
- **Respuesta exitosa (200):**
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": 1,
        "nombre": "Juan Pérez",
        "email": "juan@example.com",
        "mensaje": "Quisiera información sobre productos",
        "fecha": "2025-01-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "nombre": "María García",
        "email": "maria@example.com",
        "mensaje": "Consulta sobre servicios",
        "fecha": "2025-01-15T11:00:00.000Z"
      }
    ]
  }
  ```

#### POST /api/contactos

Registra un nuevo contacto.

- **Método:** POST
- **URL:** `http://localhost:3000/api/contactos`
- **Content-Type:** `application/json`
- **Body (JSON):**
  ```json
  {
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "mensaje": "Quisiera información sobre productos"
  }
  ```
- **Respuesta exitosa (201):**
  ```json
  {
    "success": true,
    "message": "Contacto registrado exitosamente",
    "data": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "mensaje": "Quisiera información sobre productos",
      "fecha": "2025-01-15T10:30:00.000Z"
    }
  }
  ```
- **Respuesta de error (400) - Validación fallida:**
  ```json
  {
    "error": true,
    "message": "Error de validación",
    "errors": [
      "El campo nombre es requerido",
      "El formato del email no es válido"
    ]
  }
  ```

## 🔍 Validaciones

El endpoint POST /api/contactos valida:

- **nombre**: Requerido, máximo 100 caracteres
- **email**: Requerido, formato válido de email, máximo 255 caracteres
- **mensaje**: Requerido

Si alguna validación falla, se devuelve un código 400 con un array de errores descriptivos.

## 🗄️ Base de Datos

### Estructura de la tabla `contactos`

```sql
CREATE TABLE contactos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fecha (fecha),
    INDEX idx_email (email)
);
```

### Campos

- `id`: Identificador único (auto-incremental)
- `nombre`: Nombre del contacto (máximo 100 caracteres)
- `email`: Email del contacto (máximo 255 caracteres)
- `mensaje`: Mensaje de la consulta (texto)
- `fecha`: Fecha y hora de registro (se asigna automáticamente)

## 🔧 Funcionalidades Técnicas

### Middleware

- **Logger**: Registra todas las peticiones HTTP con timestamp, método, URL e IP
- **Error Handler**: Manejo centralizado de errores con respuestas JSON apropiadas

### Manejo de Errores

El servidor maneja los siguientes tipos de errores:

- **400 - Bad Request**: Errores de validación de datos
- **404 - Not Found**: Rutas no encontradas (manejado por Express)
- **500 - Internal Server Error**: Errores del servidor o base de datos

Todos los errores se devuelven en formato JSON con un mensaje descriptivo.

### Configuración

Las credenciales de la base de datos y otras configuraciones se cargan desde el archivo `.env` usando `dotenv`. El archivo `.env` no se versiona por seguridad.

## 📝 Ejemplos de Uso

### Ejemplo 1: Obtener todos los contactos

```bash
curl http://localhost:3000/api/contactos
```

### Ejemplo 2: Registrar un nuevo contacto

```bash
curl -X POST http://localhost:3000/api/contactos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "mensaje": "Quisiera información sobre productos"
  }'
```

### Ejemplo 3: Verificar estado del servidor

```bash
curl http://localhost:3000/health
```

## 🧪 Pruebas con Postman

Se incluye una colección de Postman (`AgroTrack_API.postman_collection.json`) con todas las peticiones configuradas para facilitar las pruebas.

Para importar:
1. Abrir Postman
2. File → Import
3. Seleccionar el archivo `AgroTrack_API.postman_collection.json`
4. Las peticiones estarán disponibles en la colección "AgroTrack API"

## 🚨 Solución de Problemas

### Error de conexión a MySQL

- Verificar que MySQL esté ejecutándose
- Verificar las credenciales en `.env`
- Verificar que la base de datos `agrotrack` exista
- Verificar que la tabla `contactos` esté creada

### Puerto en uso

Si el puerto 3000 está en uso, cambiar el valor de `PORT` en `.env`.

### Dependencias no instaladas

Ejecutar `npm install` para instalar todas las dependencias.

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Dispositivos**: Desktop, tablet, móvil
- **Sistemas operativos**: Windows, macOS, Linux
- **Node.js**: Versión 14 o superior
- **MySQL**: Versión 5.7 o superior (o MariaDB 10.2+)

## 🔮 Posibles Mejoras Futuras

- Implementación de autenticación JWT
- Sistema de roles y permisos
- Panel de administración
- Endpoints adicionales (PUT, DELETE)
- Paginación en GET /api/contactos
- Búsqueda y filtrado de contactos
- Implementación de HTTPS
- Sistema de notificaciones
- Dashboard con estadísticas
- Tests automatizados

## 👥 Contribución

Este es un proyecto académico. Para contribuir:

1. Fork del repositorio
2. Crear una rama para la nueva funcionalidad
3. Realizar los cambios
4. Crear un Pull Request

## 📄 Licencia

Este proyecto es de uso educativo y demostrativo.

## 📞 Contacto

Para consultas sobre el proyecto, contactar al equipo de desarrollo de AgroTrack.

---

**Desarrollado para AgroTrack - Versión 2.0**
