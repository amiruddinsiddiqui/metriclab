import ResponseFormatter from "../utils/responseFormatter.js";


//===================================
// Authorization Middleware
// Checks if user has required roles
//===================================
const authorizeMiddleware = (allowedRoles = []) => (req, res, next) => {
    try {
        //===================================
        // Validate user existence & role
        //===================================
        if (!req.user || !req.user.role) {
            return res
                .status(403)
                .json(ResponseFormatter.error("Forbidden", 403));
        }

        //====================================
        // skip
        //====================================
        // If no roles specified -> allow all
        //====================================
        if(allowedRoles.length === 0) {
            next();
        }

        //===================================
        // Check if user's role is permitted
        //===================================
        if(!allowedRoles.includes(req.user.role)) {
            return res.status(403)
                .json(ResponseFormatter.error("Insufficient permission", 403));
        }

        //===================================
        // User is authorized -> proceed
        //===================================
        next();
    } catch (e) {
        //===================================
        // Fallback error response
        //===================================
        return res
            .status(403)
            .json(ResponseFormatter.error("Forbidden", 403));

    }
}

export default authorizeMiddleware;