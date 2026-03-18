import logger from "../config/logger.js";



//===================================
// Request Logger Middleware
// Logs incoming requests with duration
//===================================
const requestLoggerMiddleware = (req, res, next) => {

    //===================================
    // Capture request start time
    //===================================
    const start = Date.now();


    //===================================
    // Listen for response completion
    //===================================
    res.on('finish', () => {
        const duration = Date.now() - start;

        // log req details
        logger.info(
            'HTTP %s %s %s %dms',
            req.method,
            req.originalUrl || req.url,
            req.ip || req.socket.remoteAddress,

            duration, {
                method: req.method,
                path: req.originalUrl || req.url,
                status: req.statusCode,
                duration
            });
    });

    // Move to next middleware
    next();
}


export default requestLoggerMiddleware;