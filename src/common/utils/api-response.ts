export const ApiResponse = (message: string, data?: any, meta?: any) => ({
    success: true,
    meta,
    message,
    data,
});
