
//===================================
// Custom AppError class
// Extends native js Error class
// Used for structured error handling
//===================================
class AppError extends Error {
    constructor(message, statusCode=500, error=null) {
        // Call parent Error class constructor
        // Sets the error message
        super(message);

        this.statusCode = statusCode;
        this.error = error;
        this.isOperational = true;

        // Removes constructor call from stack trace
        // Makes error stack cleaner and easier to read
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;