import logger from '../config/logger.js';
import ResponseFormatter from "../utils/responseFormatter.js";


const errorHandlerMiddleware = (error, req, res, next) => {
    let statusCode = req.statusCode || 500;
    let message = error.message || "Internal server error";
    let errors = error.errors || null;

    logger.error('Error occurred:', {
        message:error.message,
        statusCode,
        stack: error.stack,
        path:req.path,
        method:req.method,
    })

    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errors = Object.values(error.errors).map((e) => e.message);
    }
    else if (error.name === 'MongoServerError' && error.code === 11000) {
        statusCode = 409;
        message = "Duplicate key error";
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    res.status(statusCode).json(
        ResponseFormatter.error(message, statusCode, errors)
    );

}

export default errorHandlerMiddleware;