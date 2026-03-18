import {APPLICATION_ROLES} from "../../../shared/constants/roles.js";
import config from "../../../shared/config/index.js";
import ResponseFormatter from "../../../shared/utils/responseFormatter.js";

export class AuthController {

    // initialize controller with auth service
    constructor(authService) {
        if (!authService){
            throw new Error("authService is required");
        }

        this.authService = authService;
    }

    // handle super admin onboarding request
    async onboardSuperAdmin(req, res, next) {
        try {
            // get user data from request body
            const {username, email, password} = req.body;
            const superAdminData = {
                username,
                email,
                password,
                role: APPLICATION_ROLES.SUPER_ADMIN,
            };

            // call service to create super admin
            const {user, token} = await this.authService.onboardSuperAdmin(superAdminData);

            // store jwt token in cookie
            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                maxAge: config.cookie.expiresIn
            });

            // send success response
            res.status(201).json(ResponseFormatter.success(
                user,
                "super admin created successfully",
                201
            ));
        } catch (e) {
            next(e); // pass error to middleware
        }
    }

    // creates new user & sets auth cookie
    async register(req, res, next) {
        try {
            const {username, email, password, role} = req.body;
            const userData = {
                username, email, password,
                role: role || APPLICATION_ROLES.CLIENT_VIEWER
            }
            // call service to register user
            const {token, user} = await this.authService.register(userData);

            // store jwt token in cookie
            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                maxAge: config.cookie.expiresIn
            });

            // send success response
            res.status(201).json(ResponseFormatter.success(
                user,
                "user created successfully",
                201
            ));
        } catch (e) {
            next(e)
        }
    }

    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const { user, token } = await this.authService.login(username, password);

            // store jwt token in cookie
            res.cookie("authToken", token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                maxAge: config.cookie.expiresIn
            });

            // send success response
            res.status(200).json(ResponseFormatter.success(
                user,
                "user logged-in successfully",
                200
            ));
        } catch (e) {
            next(e);
        }
    }

    // fetches profile using authenticated user
    async getProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const result = await this.authService.getProfile(userId);

            res.status(200).json(ResponseFormatter.success(result, "Profile fetched successfully", 200));
        } catch (e) {
            next(e);
        }
    }

    // clears auth cookie
    async logout(req, res, next) {
        try {
            res.clearCookie("authToken");

            res.status(200).json(ResponseFormatter.success("Logout successful", 200));
        } catch (e) {
            next(e);
        }
    }
}