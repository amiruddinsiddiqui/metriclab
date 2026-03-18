import AppError from "../../../shared/utils/AppError.js";
import jwt from "jsonwebtoken";
import config from "../../../shared/config/index.js";
import logger from "../../../shared/config/logger.js";
import bcrypt from "bcrypt";

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

    // verifies user-entered password with stored hashed password
    async comparePassword(userEnteredPassword, hashedPassword) {
        return bcrypt.compare(userEnteredPassword, hashedPassword);
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

    // handles user creation & token generation
    async register(userData){
        try {
            const existingUser = await this.userRepository.findByUsername(userData.username);
            if (existingUser) {
                throw new AppError("Username already exists", 409);
            }

            const existingEmail = await this.userRepository.findByEmail(userData.email);
            if (existingEmail) {
                throw new AppError("Email already exists", 409);
            }

            const user = await  this.userRepository.create(userData);

            const token = this.generateToken(user);
            logger.info("User registered successfully", {username: user.username});

            return {
                user: this.formatUserForResponse(user),
                token,
            }
        } catch (e) {
            logger.error("Error occurred while registering user", e);
            throw e;
        }
    }

    // validates credentials & issues token
    async login(username, password) {
        try {
            const user = await this.userRepository.findByUsername(username);
            if (!user) {
                throw new AppError("Invalid Credentials", 401);
            }

            if (!user.isActive) {
                throw new AppError("Account is deactivated", 403);
            }

            const isPasswordValid = await this.comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw new AppError("Invalid Credentials", 401);
            }

            const token = this.generateToken(user);

            logger.info("user loggedIn successfully", { username: user.username });

            return {
                user: this.formatUserForResponse(user),
                token,
            }
        } catch (e) {
            logger.error("Error occurred while logging", e);
            throw e;
        }
    }

    // fetches user profile by ID
    async getProfile(userId){
        try {
            const user = await this.userRepository.findById(userId);
            if (!user){
                throw new AppError("User not found", 404);
            }

            return this.formatUserForResponse(user);
        } catch (e) {
            logger.error("Error occurred while getting profile", e);
            throw e;
        }
    }

}