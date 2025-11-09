export const commonResponse = (message: string, data?: any, meta?: any) => ({
    success: true,
    meta,
    message,
    data,
});
