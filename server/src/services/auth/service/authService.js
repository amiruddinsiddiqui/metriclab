import AppError from "../../../shared/utils/AppError.js";
import jwt from "jsonwebtoken";
import config from "../../../shared/config/index.js";
import logger from "../../../shared/config/logger.js";

export class AuthService {

    // initialize service with user repository
    constructor(userRepository) {
        if(!userRepository) {
            throw new Error("UserRepository is Required");
        }

        this.userRepository = userRepository;
    };

    // generate JWT token for authenticated user
    generateToken(user) {
        const {_id, email, username, role, clientId} = user;

        const payload = {
            userId: _id,
            username,
            email,
            role,
            clientId,
        }
        return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    }

    // remove password before sending user data
    formatUserForResponse(user) {
        const userObj = user.toObject ? user.toObject() : {...user};
        delete userObj.password;
        return userObj;
    }

    // onboard the first super admin
    async onboardSuperAdmin(superAdminData) {
        try {
            const existingUser = await this.userRepository.findAll();
            // check if any user already exists
            if (existingUser && existingUser.length>0) {
                throw new AppError("Super admin onboarding is disabled", 403);
            }
            // create super admin
            const user = await this.userRepository.create(superAdminData);
            const token = this.generateToken(user);

            logger.info("Admin onboarded successfully", {username: user.username});

            return {
                user: this.formatUserForResponse(user),
                token,
            }
        } catch (e) {
            logger.error("Error occurred while Admin onboarding", e);
            throw e;
        }
    }

}