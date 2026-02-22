
//=========================================
// Response Formatter util class
// Standardizes all API responses
// Used for consistent success & error handling
//==============================================
class ResponseFormatter{

    //===================================
    // Success Response
    // Used when request is successful
    //===================================
    static success(data=null, message='success', statusCode=200) {
        return {
            success: true,
            data,
            message,
            statusCode,                             // HTTP status code
            timestamp: new Date().toISOString(),    // Response time (ISO format)
        }
    }

    //===================================
    // Error Response
    // Used for server errors
    //===================================
    static error(message='Internal Server Error', statusCode=500, error=null) {
        return {
            success: false,
            message,
            statusCode,
            error,
            timestamp: new Date().toISOString(),
        }
    }

    //===================================
    // Validation Error Response
    // Used for bad request / input errors
    //=====================================
    static validationError(error=null) {
        return {
            success: false,
            error,
            message: "Validation Failed",
            statusCode: 400,
            timestamp: new Date().toISOString(),
        }
    }

    //===================================
    // Paginated Response
    // Used when returning paginated data
    //===================================
    static paginated(data=null, page, limit, total) {
        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            timestamp: new Date().toISOString(),
        }
    }

}


export default ResponseFormatter;