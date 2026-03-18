import ResponseFormatter from "../utils/responseFormatter.js";


//=====================================
// Validation Middleware
// Validates request body using schema
//=====================================
const validateMiddleware = (schema) => (req, res, next) => {
    //===========================================
    // If no schema provided -> skip validation
    //===================================
    if (!schema) {
        return next();
    }

    const errors = [];
    const body = req.body || {};

    //===================================
    // Iterate through schema fields
    //===================================
    Object.entries(schema).forEach(([field, rules]) => {
        const value = body[field]; // body["username"]

        //===================================
        // Required field check
        //===================================
        if(rules.required && (value === undefined || value === null || value === '')){
            errors.push(`${field} is required`);
            return
        }

        //======================================
        // Minimum length validation (for strings)
        //==========================================
        if(rules.minLength && typeof value === 'string' && value.length < rules.minLength){
            errors.push(`${field} must be at least ${rules.minLength} characters`);
        }

        //===================================
        // Custom validation function
        //===================================
        if(rules.custom && typeof rules.custom === 'function'){
            const customErr = rules.custom(value, body);
            if (customErr) errors.push(customErr);
        }
    })

    //================================================
    // If validation errors exist -> return response
    //===============================================
    if (errors.length){
        return res.status(400).json(ResponseFormatter.error("validation failed", 400, errors));
    }

    next();
}

export default validateMiddleware;