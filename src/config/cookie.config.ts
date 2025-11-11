export const cookieConfig = {
    httpOnly: true, // JavaScript no puede leer la cookie
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // 'none' para cross-domain en producción
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 días en ms
    path: '/',  // Cookie disponible en todas las rutas
};