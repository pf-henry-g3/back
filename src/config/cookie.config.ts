// src/common/config/cookie.config.ts
export const cookieConfig = {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
    domain: undefined,
};
