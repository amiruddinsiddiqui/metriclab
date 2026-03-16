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
}