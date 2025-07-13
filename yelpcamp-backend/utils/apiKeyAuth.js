const rateLimit = require('express-rate-limit');

// API Rate Limiting - more restrictive for API access
const apiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many API requests, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware to validate shared API token
const validateApiToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const apiToken = process.env.API_ACCESS_TOKEN;
    
    // Check if API token is configured
    if (!apiToken) {
        console.error('❌ API_ACCESS_TOKEN not configured in environment variables');
        return res.status(500).json({
            success: false,
            error: 'API access not configured'
        });
    }
    
    // Check if authorization header exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Missing or invalid Authorization header. Use: Authorization: Bearer YOUR_API_TOKEN'
        });
    }
    
    // Extract token from header
    const providedToken = authHeader.split(' ')[1];
    
    // Validate token
    if (providedToken !== apiToken) {
        console.log(`❌ Invalid API token attempt from IP: ${req.ip}`);
        return res.status(401).json({
            success: false,
            error: 'Invalid API token'
        });
    }
    
    // Log successful API access
    console.log(`✅ Valid API token access from IP: ${req.ip} for endpoint: ${req.path}`);
    
    next();
};

module.exports = {
    validateApiToken,
    apiRateLimit
}; 