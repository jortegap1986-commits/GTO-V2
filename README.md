# GTO-V2: Gestión de Tiempos Operativos

GTO-V2 es una aplicación web avanzada diseñada para visualizar y analizar la productividad operativa en tiempo real. Utiliza Inteligencia Artificial (Google Gemini) para proporcionar insights detallados sobre el desempeño de los equipos y optimizar los procesos logísticos.

## Características Principales

- **Análisis de Productividad:** Visualización de tiempos operativos, ociosos y de conexión.
- **Insights con IA:** Generación automática de focos del día, análisis de usuarios destacados y observaciones críticas.
- **Sincronización con Gmail:** Carga automática de datos desde archivos adjuntos en correos electrónicos.
- **Modelo de Productividad:** Comparativa entre productividad real y metas planificadas.
- **Optimizador de Flujo (Rack):** Diagramas de "Spaghetti" para visualizar rutas reales vs. rutas optimizadas (Z-Pick).
- **Integración con Firebase:** Autenticación segura y almacenamiento de perfiles de usuario.

## Requisitos Previos

- **Node.js:** Versión 18 o superior.
- **Google Cloud Project:** Con las APIs de Gmail y Gemini habilitadas.
- **Firebase Project:** Configurado con Firestore y Google Auth.

## Configuración de Variables de Entorno

Para que la aplicación funcione correctamente, debes configurar las siguientes variables de entorno:

```env
# Google AI Studio / Gemini API
GEMINI_API_KEY=tu_api_key_de_gemini

# Google OAuth (Gmail API)
GMAIL_CLIENT_ID=tu_client_id
GMAIL_CLIENT_SECRET=tu_client_secret

# Sesión
SESSION_SECRET=una_cadena_aleatoria_segura

# URL de la Aplicación (para redireccionamientos OAuth)
APP_URL=https://tu-app.run.app
```

## Instalación y Desarrollo

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

3. Construye para producción:
   ```bash
   npm run build
   ```

4. Inicia en producción:
   ```bash
   npm start
   ```

## Estructura del Proyecto

- `/src`: Código fuente de la aplicación React.
- `/components`: Componentes de UI reutilizables.
- `/services`: Lógica de procesamiento de datos y servicios de IA.
- `/server.ts`: Servidor Express con endpoints de API e integración de IA.
- `/netlify`: Configuración para despliegue en Netlify (Serverless Functions).
- `/firebase.ts`: Configuración e inicialización de Firebase.

## Despliegue

La aplicación está preparada para ser desplegada en **Netlify** (usando Netlify Functions para el backend) o en cualquier entorno compatible con **Node.js** (como Google Cloud Run).

---
Desarrollado con ❤️ para la optimización operativa.
