import express from "express";
import dependencies from "../dependencies/dependencies.js";
import authorizeMiddleware from "../../../shared/middlewares/authorize.middleware.js";
import authenticateMiddleware from "../../../shared/middlewares/authenticate.middleware.js";
import validateMiddleware from "../../../shared/middlewares/validate.middleware.js";
import requestLoggerMiddleware from "../../../shared/middlewares/requestLogger.middleware.js";
import { onboardSuperAdminSchema, loginSchema, registrationSchema } from "../validation/authSchema.js";
import { APPLICATION_ROLES } from "../../../shared/constants/roles.js";


//===================================
// Auth Routes
// Handles authentication & user actions
//=======================================
const router = express.Router();

//====================================
// Dependency Injection (Controllers)
//=====================================
const { controllers } = dependencies;
const authController = controllers.authController

//===================================
// Onboard Super Admin
// Public route (initial setup)
//===================================
router.post("/onboard-super-admin",
    requestLoggerMiddleware,
    (req, res, next) => authController.onboardSuperAdmin(req, res, next)
);

//===================================
// Register User
// Only accessible by super_admin
//===================================
router.post(
    "/register",
    requestLoggerMiddleware,
    authenticateMiddleware,
    authorizeMiddleware([APPLICATION_ROLES.SUPER_ADMIN]),
    validateMiddleware(registrationSchema),
    (req, res, next) => authController.register(req, res, next),

)

router.post(
    "/login",
    requestLoggerMiddleware,
    validateMiddleware(loginSchema),
    (req, res, next) => authController.login(req, res, next),
)

router.get("/profile",
    requestLoggerMiddleware,
    authenticateMiddleware,
    (req, res, next) => authController.getProfile(req, res, next),
)

//===================================
// Logout User
// Clears token (cookie)
//===================================
router.get(
    "/logout",
    requestLoggerMiddleware,
    (req, res, next) => authController.logout(req, res, next),
)

export default router;