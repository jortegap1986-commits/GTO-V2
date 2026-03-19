import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import cookieSession from 'cookie-session';
import * as XLSX from 'xlsx';
import archiver from 'archiver';

let __filename = '';
let __dirname = '';
try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
        __filename = fileURLToPath(import.meta.url);
        __dirname = path.dirname(__filename);
    } else {
        __dirname = process.cwd();
    }
} catch {
    __dirname = process.cwd();
}

const app = express();
app.set('trust proxy', 1); // Trust first proxy for secure cookies

// Aumenta el límite del payload para manejar grandes conjuntos de datos si es necesario.
app.use(express.json({ limit: '10mb' }));

// --- Configuración de Sesión ---
app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'gto-secret-key'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true,
    sameSite: 'none'
}));

// --- Configuración de Google OAuth2 ---
// oauth2Client is created per request below

const GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email'
];

// --- Configuración de la API de Gemini ---
// La clave API se accede de forma segura desde las variables de entorno del servidor.
let genAI: GoogleGenAI | null = null;
try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        console.warn("La variable de entorno GEMINI_API_KEY o API_KEY no está configurada.");
    } else {
        genAI = new GoogleGenAI({ apiKey: apiKey });
    }
} catch (e) {
    console.error("Error initializing GoogleGenAI:", e);
}


// --- Esquemas de la API de Gemini (traducidos a objetos JS) ---
const insightsSchema = {
    type: 'OBJECT',
    properties: {
        focoDelDia: {
            type: 'OBJECT',
            description: "El hallazgo más importante y accionable del día. Debe ser una observación crítica o una felicitación notable.",
            properties: {
                titulo: { type: 'STRING', description: "Un título corto y llamativo para el hallazgo principal." },
                descripcion: { type: 'STRING', description: "Una descripción de 1-2 frases explicando el hallazgo." }
            }
        },
        topUsuariosOperativos: {
            type: 'ARRAY',
            description: "Ranking del top 10 de usuarios con el MAYOR tiempo operativo. Ordenar de mayor a menor.",
            items: {
                type: 'OBJECT',
                properties: {
                    usuario: { type: 'STRING', description: "Nombre completo del usuario." },
                    tiempoMs: { type: 'NUMBER', description: "Tiempo operativo total en milisegundos." },
                    tiempoFormateado: { type: 'STRING', description: "Tiempo operativo formateado como 'Xh Ym Zs'." }
                }
            }
        },
        topUsuariosInactivos: {
            type: 'ARRAY',
            description: "Ranking del top 10 de usuarios con el MAYOR tiempo inactivo. Ordenar de mayor a menor.",
            items: {
                type: 'OBJECT',
                properties: {
                    usuario: { type: 'STRING', description: "Nombre completo del usuario." },
                    tiempoMs: { type: 'NUMBER', description: "Tiempo inactivo total en milisegundos." },
                    tiempoFormateado: { type: 'STRING', description: "Tiempo inactivo formateado como 'Xh Ym Zs'." }
                }
            }
        },
        observaciones: {
            type: 'ARRAY',
            description: "Lista de 3 a 5 observaciones clave, presentadas como feedback positivo o negativo.",
            items: {
                type: 'OBJECT',
                properties: {
                    tipo: { type: 'STRING', enum: ['positivo', 'negativo'], description: "Clasifica el feedback." },
                    texto: { type: 'STRING', description: "El texto de la observación." }
                }
            }
        }
    }
};
const userInsightSchema = {
    type: 'OBJECT',
    properties: {
        kpis: {
            type: 'ARRAY',
            description: "Una lista de 3-4 KPIs clave para el usuario.",
            items: {
                type: 'OBJECT',
                properties: {
                    titulo: { type: 'STRING', description: "Nombre del KPI, ej: 'Tiempo Total Conectado'." },
                    valor: { type: 'STRING', description: "Valor del KPI, ej: '8h 15m'." },
                    descripcion: { type: 'STRING', description: "Contexto breve, ej: 'De 07:05 a 15:20'." }
                }
            }
        },
        distribucionTiempo: {
            type: 'ARRAY',
            description: "Desglose del tiempo total en diferentes categorías.",
            items: {
                type: 'OBJECT',
                properties: {
                    etiqueta: { type: 'STRING', description: "Label, e.g., 'Tiempo Efectivo' or 'Tiempo Ocioso'."},
                    tiempoMs: { type: 'NUMBER', description: "Time in milliseconds."},
                    porcentaje: { type: 'NUMBER', description: "Percentage of total time (0-100)."},
                    color: { type: 'STRING', description: "Color hint: 'emerald' for effective, 'amber' for idle."}
                }
            }
        },
        productividadHoraria: {
            type: 'ARRAY',
            description: "Transacciones por hora para graficar. Asegúrate de incluir todas las horas desde la primera hasta la última, incluso si una hora tiene 0 transacciones.",
            items: {
                type: 'OBJECT',
                properties: {
                    hora: { type: 'STRING', description: "La hora en formato 'HH:00'."},
                    transacciones: { type: 'NUMBER', description: "Número de transacciones en esa hora."}
                }
            }
        },
        resumenAnalisis: {
            type: 'STRING',
            description: "Un resumen de 1-2 frases del rendimiento general del usuario, destacando patrones o picos de productividad."
        },
        sugerenciaAccionable: {
            type: 'STRING',
            description: "Una única sugerencia concisa y práctica para que el supervisor la utilice con el usuario."
        }
    }
};
const dailyFeedbackSchema = {
    type: 'OBJECT',
    properties: {
        feedback: { 
            type: 'STRING', 
            description: "Un resumen general y constructivo sobre la tendencia de rendimiento del usuario, considerando tanto el tiempo operativo como la eficiencia (transacciones). Máximo 40 palabras." 
        }
    },
    required: ['feedback']
};


// --- Endpoints de la API ---

// --- Rutas de Autenticación Gmail ---
app.get('/api/auth/google/url', (req, res) => {
    try {
        if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
            return res.status(500).json({ error: "Las credenciales de Google (GMAIL_CLIENT_ID y GMAIL_CLIENT_SECRET) no están configuradas en el servidor." });
        }

        const redirectUri = req.query.redirectUri as string || `${process.env.APP_URL || process.env.URL}/auth/google/callback`;
        
        // Create a temporary client with the exact redirect URI requested by the client
        const tempClient = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            redirectUri
        );

        const url = tempClient.generateAuthUrl({
            access_type: 'offline',
            scope: GMAIL_SCOPES,
            prompt: 'consent',
            state: Buffer.from(JSON.stringify({ redirectUri })).toString('base64')
        });
        res.json({ url });
    } catch (error) {
        console.error("Error generating Google Auth URL:", error);
        res.status(500).json({ error: "Error interno al generar la URL de autenticación: " + (error instanceof Error ? error.message : String(error)) });
    }
});

app.get('/auth/google/callback', async (req, res) => {
    const { code, state } = req.query;
    try {
        let redirectUri = '';
        if (state) {
            try {
                const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString('utf-8'));
                redirectUri = decodedState.redirectUri;
            } catch (e) {
                console.error("Error decoding state:", e);
            }
        }
        
        if (!redirectUri) {
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.headers['x-forwarded-host'] || req.get('host');
            redirectUri = `${protocol}://${host}/auth/google/callback`;
        }

        const tempClient = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            redirectUri
        );

        const { tokens } = await tempClient.getToken(code as string);
        req.session!.tokens = tokens; // Keep for fallback
        
        res.send(`
            <html>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', tokens: ${JSON.stringify(tokens)} }, '*');
                            window.close();
                        } else {
                            window.location.href = '/';
                        }
                    </script>
                    <p>Autenticación exitosa. Esta ventana se cerrará automáticamente.</p>
                </body>
            </html>
        `);
    } catch (error) {
        console.error("Error en el callback de Google:", error);
        const err = error as Error & { response?: { data?: { error_description?: string; error?: string } } };
        if (err.response && err.response.data) {
            console.error("Detalle de la respuesta de Google:", err.response.data);
        }
        const errorMessage = err.response?.data?.error_description || err.response?.data?.error || err.message || 'Unknown error';
        res.status(500).send(`
            <html>
                <body style="font-family: sans-serif; padding: 20px;">
                    <h2 style="color: red;">Error en la autenticación</h2>
                    <p><strong>Detalle del error:</strong> ${errorMessage}</p>
                    <p><strong>Error original:</strong> ${error.message}</p>
                    <p>Por favor, toma una captura de esta pantalla y compártela en el chat.</p>
                </body>
            </html>
        `);
    }
});

app.get('/api/auth/status', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return res.json({ isAuthenticated: true });
    }
    res.json({ isAuthenticated: !!req.session?.tokens });
});

app.post('/api/auth/logout', (req, res) => {
    req.session = null;
    res.json({ success: true });
});

// --- Ruta de Sincronización Gmail ---
app.get('/api/gmail/sync', async (req, res) => {
    let tokens = req.session?.tokens;
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            tokens = JSON.parse(authHeader.substring(7));
        } catch (e) {
            console.error("Error parsing tokens from header", e);
        }
    }

    if (!tokens) {
        res.status(401).json({ error: "No autenticado con Google" });
        return;
    }

    try {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.get('host');
        const redirectUri = `${protocol}://${host}/auth/google/callback`;

        const tempClient = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            redirectUri
        );
        tempClient.setCredentials(tokens);
        const gmail = google.gmail({ version: 'v1', auth: tempClient });

        const sender = req.query.sender as string;
        let query = 'has:attachment "SEGUIMIENTO DE MOV INBOUND"';
        if (sender) {
            query += ` from:${sender}`;
        }

        // Buscar correos con el asunto o nombre de archivo especificado
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: 5
        });

        const messages = response.data.messages || [];
        if (messages.length === 0) {
            res.status(404).json({ error: "No se encontraron correos con archivos de datos compatibles." });
            return;
        }

        // Intentar obtener el archivo del mensaje más reciente
        for (const message of messages) {
            const msg = await gmail.users.messages.get({
                userId: 'me',
                id: message.id!
            });

            let attachmentPart: import('googleapis').gmail_v1.Schema$MessagePart | null = null;
            
            const findAttachment = (part: import('googleapis').gmail_v1.Schema$MessagePart) => {
                if (part.filename && (
                    part.filename.toLowerCase().endsWith('.csv') || 
                    part.filename.toLowerCase().endsWith('.xlsx') || 
                    part.filename.toLowerCase().endsWith('.xls')
                )) {
                    attachmentPart = part;
                    return;
                }
                if (part.parts) {
                    for (const p of part.parts) {
                        findAttachment(p);
                        if (attachmentPart) return;
                    }
                }
            };

            if (msg.data.payload) {
                findAttachment(msg.data.payload);
            }

            if (attachmentPart) {
                const attachmentId = attachmentPart.body?.attachmentId;
                if (attachmentId) {
                    const attachment = await gmail.users.messages.attachments.get({
                        userId: 'me',
                        messageId: message.id!,
                        id: attachmentId
                    });

                    // Gmail API returns base64url encoded string
                    const base64Data = attachment.data.data!.replace(/-/g, '+').replace(/_/g, '/');
                    const buffer = Buffer.from(base64Data, 'base64');
                    
                    let data = '';
                    const filename = attachmentPart.filename?.toLowerCase() || '';
                    
                    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
                        const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        data = XLSX.utils.sheet_to_csv(worksheet, { FS: ';', dateNF: 'dd/mm/yyyy hh:mm:ss' });
                    } else {
                        data = buffer.toString('utf16le');
                        if (data.charCodeAt(0) === 0xFEFF) {
                            data = data.slice(1);
                        }
                    }
                    
                    res.json({ 
                        filename: attachmentPart.filename,
                        content: data,
                        subject: msg.data.payload?.headers?.find(h => h.name === 'Subject')?.value,
                        date: msg.data.payload?.headers?.find(h => h.name === 'Date')?.value
                    });
                    return;
                }
            }
        }

        res.status(404).json({ error: "No se encontró un archivo válido en los correos recientes." });

    } catch (error) {
        console.error("Error sincronizando con Gmail:", error);
        res.status(500).json({ error: "Error al sincronizar con Gmail" });
    }
});

app.post('/api/insights', async (req, res) => {
    try {
        const { simplifiedData } = req.body;
        if (!simplifiedData || simplifiedData.length === 0) {
             res.status(400).json({ error: "No se proporcionaron datos de usuario para el análisis." });
             return;
        }
        
        const prompt = `
            Eres un analista experto en productividad para un centro de distribución. Tu idioma es el ESPAÑOL.
            Analiza los siguientes datos de sesión de usuarios. El campo 'usuario' es el ID de sistema, 'nombre' es el nombre completo, 'proceso' es la actividad principal y 'area' es el departamento. Usa el campo 'nombre' para identificar a las personas en tu respuesta.

            Tu objetivo es:
            1.  **Foco del Día:** Identificar el hallazgo MÁS importante del día (positivo o negativo) y presentarlo de forma destacada.
            2.  **Rankings Top 10:** Crear dos rankings de 10 usuarios cada uno: los más productivos (mayor tiempo operativo) y los más inactivos (mayor tiempo inactivo). En el campo 'usuario' del JSON, coloca el nombre completo de la persona.
            3.  **Observaciones Clave:** Extraer de 3 a 5 observaciones importantes, enmarcadas como feedback 'positivo' para reconocer el buen trabajo o 'negativo' para señalar áreas de mejora.

            Utiliza el esquema JSON proporcionado para estructurar tu respuesta. Sé directo y basa tus conclusiones únicamente en los datos.

            Datos de Actividad de Usuarios:
            ${JSON.stringify(simplifiedData, null, 2)}
        `;

        if (!genAI) {
            return res.status(500).json({ error: "La API de Gemini no está configurada en el servidor." });
        }
        const response = await genAI.models.generateContent({
             model: "gemini-2.5-flash",
             contents: prompt,
             config: {
                responseMimeType: "application/json",
                responseSchema: insightsSchema,
             }
        });
        
        const jsonText = response.text?.trim();
        if (jsonText) {
            res.json(JSON.parse(jsonText));
        } else {
            res.status(500).json({ error: 'Respuesta vacía de la IA.' });
        }

    } catch (error) {
        console.error("Error en /api/insights:", error);
        res.status(500).json({ error: 'Fallo al obtener análisis de IA del servidor.' });
    }
});

app.post('/api/user-insights', async (req, res) => {
    try {
        const { userName, userData } = req.body;
        if (!userName || !userData) {
             res.status(400).json({ error: "No se proporcionó el nombre o los datos del usuario." });
             return;
        }

        const simplifiedLogs = userData.logs.map((log: { timestamp: string }) => ({
            timestamp: log.timestamp
        }));

        if (simplifiedLogs.length === 0) {
             res.status(400).json({ error: "El usuario no tiene registros de actividad para analizar." });
             return;
        }
        
        const prompt = `
            Eres un analista de datos experto en operaciones de almacén. Tu idioma es ESPAÑOL.
            Analiza los registros de transacciones de un único usuario, "${userData.nombre}" (ID de sistema: ${userName}), y genera un dashboard con la estructura JSON definida.

            **Instrucciones Clave:**
            1.  **KPIs:** Calcula 3-4 KPIs clave. Incluye:
                - Tiempo Total Conectado (desde la primera a la última transacción).
                - Tiempo Operativo Total (sumando duraciones activas).
                - Tiempo Ocioso Total.
                - Productividad (total de transacciones / horas operativas).
            2.  **Distribución de Tiempo:** Calcula el porcentaje que representan el 'Tiempo Efectivo' y el 'Tiempo Ocioso' sobre el tiempo total conectado.
            3.  **Productividad por Hora:** Agrupa las transacciones por hora y cuenta cuántas ocurrieron en cada hora. El rango debe cubrir desde la hora de la primera transacción hasta la hora de la última. Si en una hora intermedia no hay transacciones, debe aparecer con valor 0.
            4.  **Análisis y Sugerencia:** Escribe un resumen conciso y una sugerencia accionable.

            **Datos Brutos del Usuario:**
            - Usuario: ${userName}
            - Nombre: ${userData.nombre}
            - Área: ${userData.area}
            - Proceso: ${userData.proceso}
            - Tiempo Operativo Total (calculado en ms): ${userData.operativeTime}
            - Tiempo Inactivo Total (calculado en ms): ${userData.idleTime}
            - Transacciones Totales: ${userData.totalTransactions}
            - Lista de Timestamps de Transacciones (ISO 8601):
              ${JSON.stringify(simplifiedLogs.slice(0, 200), null, 2)} 
              ${simplifiedLogs.length > 200 ? `\n...(y ${simplifiedLogs.length - 200} más registros)` : ''}

            Genera la respuesta JSON siguiendo estrictamente el esquema proporcionado.
        `;

        if (!genAI) {
            return res.status(500).json({ error: "La API de Gemini no está configurada en el servidor." });
        }
        const response = await genAI.models.generateContent({
             model: "gemini-2.5-flash",
             contents: prompt,
             config: {
                responseMimeType: "application/json",
                responseSchema: userInsightSchema,
             }
        });
        
        const jsonText = response.text?.trim();
        if (jsonText) {
            res.json(JSON.parse(jsonText));
        } else {
            res.status(500).json({ error: 'Respuesta vacía de la IA.' });
        }

    } catch (error) {
        console.error(`Error en /api/user-insights para ${req.body.userName}:`, error);
        res.status(500).json({ error: `Fallo al obtener análisis de IA para el usuario ${req.body.userName} del servidor.` });
    }
});

app.post('/api/daily-feedback', async (req, res) => {
    try {
        const { usersData } = req.body;
        if (!usersData || usersData.length === 0) {
             res.status(400).json({ error: "No se proporcionaron datos diarios de usuario para el feedback." });
             return;
        }

        const prompt = `
            Eres un coach de rendimiento para un centro de distribución. Tu idioma es el ESPAÑOL.
            Analiza la secuencia histórica de datos de operación diaria y transacciones para un único usuario.
            Tu objetivo es identificar la relación entre el tiempo operativo y la productividad (transacciones). Por ejemplo, si un usuario tiene un alto tiempo operativo pero pocas transacciones, o viceversa.
            Proporciona un feedback general y conciso (máx. 40 palabras) sobre esta tendencia de eficiencia.

            - 'date' es la fecha del registro (YYYY-MM-DD).
            - 'operativeTimeFormatted' es el tiempo operativo para ese día.
            - 'transactions' es el número de transacciones en ese día.
            - 'variation' es el cambio porcentual con respecto al día anterior. Un valor 'Infinity' indica que es el primer día registrado.

            Tu respuesta debe ser un único objeto JSON con la clave "feedback".

            Datos de la secuencia diaria del usuario:
            ${JSON.stringify(usersData, null, 2)}
        `;

        if (!genAI) {
            return res.status(500).json({ error: "La API de Gemini no está configurada en el servidor." });
        }
        const response = await genAI.models.generateContent({
             model: "gemini-2.5-flash",
             contents: prompt,
             config: {
                responseMimeType: "application/json",
                responseSchema: dailyFeedbackSchema,
             }
        });

        const jsonText = response.text?.trim();
        if (jsonText) {
            res.json(JSON.parse(jsonText));
        } else {
            res.status(500).json({ error: 'Respuesta vacía de la IA.' });
        }
    } catch (error) {
        console.error("Error en /api/daily-feedback:", error);
        res.status(500).json({ error: 'Fallo al obtener el feedback diario del servidor.' });
    }
});

app.post('/api/github/webhook', (req, res) => {
    // Basic webhook handler
    console.log('GitHub Webhook received:', req.body);
    // You can add logic here to handle specific events like push, pull_request, etc.
    res.status(200).send('Webhook received');
});

// --- GitHub API Integration ---
app.get('/api/auth/github/url', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
        return res.status(500).json({ error: "GITHUB_CLIENT_ID no está configurado." });
    }
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const redirectUri = `${protocol}://${host}/auth/github/callback`;
    
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
    res.json({ url });
});

app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return res.status(500).send("Error: Credenciales de GitHub no configuradas.");
    }

    try {
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code
            })
        });

        const data = await response.json();
        if (data.access_token) {
            req.session!.githubToken = data.access_token;
            res.send(`
                <html>
                    <body>
                        <script>
                            if (window.opener) {
                                window.opener.postMessage({ type: 'GITHUB_AUTH_SUCCESS', token: '${data.access_token}' }, '*');
                                window.close();
                            } else {
                                window.location.href = '/';
                            }
                        </script>
                        <p>Autenticación de GitHub exitosa. Esta ventana se cerrará automáticamente.</p>
                    </body>
                </html>
            `);
        } else {
            res.status(400).send("Error al obtener el token de GitHub: " + JSON.stringify(data));
        }
    } catch (error) {
        console.error("Error en el callback de GitHub:", error);
        res.status(500).send("Error interno en la autenticación de GitHub.");
    }
});

app.post('/api/github/create-repo', async (req, res) => {
    const { name, description, private: isPrivate } = req.body;
    let token = req.session?.githubToken || process.env.GITHUB_TOKEN;
    
    // Check for token in Authorization header as well
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }

    if (!token) {
        return res.status(401).json({ 
            error: "No autenticado con GitHub.",
            setupInstructions: "Para usar esta función, debes conectar tu cuenta de GitHub o configurar un GITHUB_TOKEN en los Secretos."
        });
    }

    if (!name) {
        return res.status(400).json({ error: "El nombre del repositorio es obligatorio." });
    }

    try {
        const response = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'GTO-App'
            },
            body: JSON.stringify({
                name,
                description: description || 'Repositorio creado desde GTO App',
                private: !!isPrivate
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.message || "Error al crear el repositorio en GitHub.",
                details: data.errors
            });
        }

        res.json({
            success: true,
            repoUrl: data.html_url,
            fullName: data.full_name,
            data: data
        });
    } catch (error) {
        console.error("Error creating GitHub repo:", error);
        res.status(500).json({ error: "Error interno al crear el repositorio: " + (error instanceof Error ? error.message : String(error)) });
    }
});

app.get('/api/export-zip', (req, res) => {
    try {
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        res.attachment('gto-v2-source.zip');

        archive.on('error', (err) => {
            res.status(500).send({ error: err.message });
        });

        archive.pipe(res);

        // Add files from the root directory, including hidden files
        archive.glob('**/*', {
            cwd: __dirname,
            dot: true,
            ignore: [
                'node_modules/**', 
                '.git/**', 
                'dist/**', 
                '.next/**', 
                'package-lock.json',
                '*.log',
                '.DS_Store'
            ]
        });

        archive.finalize();
    } catch (error) {
        console.error("Error exporting zip:", error);
        res.status(500).send({ error: "Error al exportar el archivo ZIP." });
    }
});


// --- Servir Archivos Estáticos y Vite Middleware ---

export { app };

async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else if (!process.env.NETLIFY) {
        const staticDir = path.join(__dirname, 'dist');
        app.use(express.static(staticDir));
        app.get('*', (req, res) => {
            res.sendFile(path.join(staticDir, 'index.html'));
        });
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
}

if (!process.env.NETLIFY) {
    startServer();
}
