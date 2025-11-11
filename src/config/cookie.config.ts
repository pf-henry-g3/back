export const cookieConfig = {
    httpOnly: true, // JavaScript no puede leer la cookie
    secure: process.env.NODE_ENV === 'production', // Solo envía por HTTPS en producción
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as
        | boolean
        | 'lax'
        | 'strict'
        | 'none',  // Permite cookies en localhost (desarrollo). 'none' para cross-domain en producción
    maxAge: 7 * 24 * 60 * 60 * 1000,  // Cuánto tiempo vive la cookie (7 días en ms
    path: '/',  // En qué rutas está disponible
};