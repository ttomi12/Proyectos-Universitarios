# AgroTrack - Portal Interno
Tomas Bosco - Comisión A

Portal web interno para la empresa agroindustrial AgroTrack, desarrollado con Node.js puro (sin frameworks externos).

## 📋 Descripción

AgroTrack es un portal web interno que permite al personal de la empresa:
- Consultar información básica sobre productos y servicios
- Iniciar sesión de demostración
- Enviar formularios de contacto que se guardan en archivos

## 🚀 Características

- **Servidor HTTP básico** construido con módulos nativos de Node.js
- **Páginas estáticas** con información corporativa
- **Sistema de login** de demostración
- **Formulario de contacto** con almacenamiento en archivos
- **Interfaz moderna** y responsive
- **Manejo de errores** con códigos de estado HTTP apropiados

## 🛠️ Tecnologías Utilizadas

- **Node.js** (módulos nativos: http, fs, url, path)
- **HTML5** semántico
- **CSS3** con diseño responsive
- **JavaScript** vanilla

## 📁 Estructura del Proyecto

```
agrotrack/
├── server.js              # Servidor HTTP principal
├── public/                # Archivos estáticos
│   ├── index.html         # Página principal
│   ├── productos.html     # Información de productos
│   ├── contacto.html      # Formulario de contacto
│   ├── login.html         # Formulario de login
│   └── estilos.css        # Estilos CSS
├── data/                  # Directorio de datos
│   └── consultas.txt      # Archivo de consultas (se crea automáticamente)
├── .gitignore            # Archivos a ignorar en Git
└── README.md             # Este archivo
```

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (versión 14 o superior)

### Pasos para ejecutar

1. **Clonar o descargar el proyecto**
   ```bash
   git clone <url-del-repositorio>
   cd agrotrack
   ```

2. **Ejecutar el servidor**
   ```bash
   node server.js
   ```

3. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📖 Endpoints Disponibles

### Páginas Estáticas
- `GET /` - Página principal
- `GET /productos.html` - Información de productos
- `GET /contacto.html` - Formulario de contacto
- `GET /login.html` - Formulario de login
- `GET /estilos.css` - Archivo de estilos

### Login de Demostración
- `GET /login` - Muestra el formulario de login
- `POST /auth/recuperar` - Procesa las credenciales de login

### Formulario de Contacto
- `GET /contacto` - Muestra el formulario de contacto
- `POST /contacto/cargar` - Guarda una nueva consulta
- `GET /contacto/listar` - Muestra todas las consultas guardadas

## 🔐 Sistema de Login

El sistema de login es de demostración y acepta cualquier usuario y clave. Los datos ingresados se muestran en la respuesta para fines de prueba.

**Credenciales de ejemplo:**
- Usuario: `Juan`
- Clave: `1234`

## 📝 Formulario de Contacto

El formulario permite enviar consultas que se almacenan en el archivo `data/consultas.txt` con el siguiente formato:

```
-------------------------
Fecha: 2025-01-06 19:10
Nombre: Juan Pérez
Email: jperez@mail.com
Mensaje: Quisiera información sobre servicios.
-------------------------
```

## 🎨 Características del Diseño

- **Diseño responsive** que se adapta a diferentes tamaños de pantalla
- **Paleta de colores** verde corporativa (#2c5530, #4a7c59)
- **Tipografía moderna** con Segoe UI
- **Efectos visuales** suaves con transiciones CSS
- **Navegación intuitiva** con menú principal

## 🔧 Funcionalidades Técnicas

### Manejo de Archivos Estáticos
- Servicio automático de archivos HTML, CSS y otros recursos
- Detección automática de tipos MIME
- Manejo de errores 404 para archivos no encontrados

### Procesamiento de Formularios
- Lectura asíncrona del cuerpo de las peticiones POST
- Parsing de datos con URLSearchParams
- Validación básica de campos requeridos

### Almacenamiento de Datos
- Creación automática del directorio `data/` si no existe
- Escritura asíncrona de consultas con `fs.appendFile()`
- Formato estructurado para las entradas de datos

### Manejo de Errores
- Códigos de estado HTTP apropiados (200, 404, 500)
- Páginas de error personalizadas con diseño consistente
- Logging de errores en consola para debugging

## 🚨 Manejo de Errores

El servidor maneja los siguientes tipos de errores:

- **404 - No encontrado**: Para rutas inexistentes
- **500 - Error interno**: Para errores de lectura/escritura de archivos
- **Errores de parsing**: Para datos de formulario malformados

## 🔄 Flujo de Trabajo

1. **Inicio**: El usuario accede a la página principal
2. **Navegación**: Puede explorar productos, enviar consultas o hacer login
3. **Contacto**: Las consultas se guardan automáticamente en archivos
4. **Login**: Sistema de demostración que muestra las credenciales ingresadas
5. **Consultas**: Visualización de todas las consultas enviadas

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Dispositivos**: Desktop, tablet, móvil
- **Sistemas operativos**: Windows, macOS, Linux

## 🔮 Posibles Mejoras Futuras

- Implementación de autenticación real con base de datos
- Sistema de roles y permisos
- Panel de administración
- API REST para integración con otros sistemas
- Implementación de HTTPS
- Sistema de notificaciones
- Dashboard con estadísticas

## 👥 Contribución

Este es un proyecto de demostración académica. Para contribuir:

1. Fork del repositorio
2. Crear una rama para la nueva funcionalidad
3. Realizar los cambios
4. Crear un Pull Request

## 📄 Licencia

Este proyecto es de uso educativo y demostrativo.

## 📞 Contacto

Para consultas sobre el proyecto, contactar al equipo de desarrollo de AgroTrack.

---

**Desarrollado con ❤️ para AgroTrack**

