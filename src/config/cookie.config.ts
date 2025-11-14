// src/common/config/cookie.config.ts
export const cookieConfig = {
    httpOnly: true,
    secure: false,  // false en desarrollo local (HTTP)
    sameSite: 'lax' as const,  // 👈 'lax' es más permisivo
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    domain: 'localhost',  // 👈 AGREGAR ESTO: permite compartir entre puertos
};