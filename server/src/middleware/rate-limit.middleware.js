const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
}); 