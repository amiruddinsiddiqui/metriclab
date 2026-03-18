import ResponseFormatter from "../utils/responseFormatter.js";
import jwt from 'jsonwebtoken'
import config from "../config/index.js";
import logger from "../config/logger.js";

//===================================
// authentication Middleware
// verifies JWT & attaches user to request
//========================================
const authenticateMiddleware = async (req, res, next) => {
    try {
        let token = null;

        // extract token from cookies
        if(req.cookies && req.cookies.authToken) {
            token = req.cookies.authToken;
        }

        if(!token) {
            return res.status(401).json(ResponseFormatter.error("Authentication token is required", 401));
        }

        //===================================
        // verify JWT using secret
        //===================================
        const decoded = jwt.verify(token, config.jwt.secret);

        // extract user details from token
        const { userId, email, username, clientId, role } = decoded;

        req.user = {
            userId,
            email,
            username,
            clientId,
            role
        };

        next();
    } catch (e) {
        // log authentication failure
        logger.error("Authentication failed", {
            error: e.message,
            path: req.path,
        });

        // handle expired token
        if(e.name === 'TokenExpiredError') {
            return res.status(401).json(ResponseFormatter.error("Token expired", 401));
        }

        // handle invalid token
        return res
            .status(401)
            .json(ResponseFormatter.error("Invalid token", 401));
    }
}


export default authenticateMiddleware;