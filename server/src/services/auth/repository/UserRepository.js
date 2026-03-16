import BaseRepository from "./BaseRepository.js";
import User from "../../../shared/models/User.model.js";
import logger from "../../../shared/config/logger.js";


//==================================
// MongoDB User Repository
//==================================
class MongoUserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    async create(userData) {
        try {
            let data = {...userData}
            if (data.role === 'super_admin' && !data.permissions) {
                data.permissions = {
                    canCreateApiKeys: true,
                    canManageUsers: true,
                    canViewAnalytics: true,
                    canExportData: true,
                }
            }

            const user = new this.model(data);
            await user.save();

            logger.info("User created", {username: user.username});
            return user;
        } catch (e) {
            logger.error("Error while creating user", e)
            throw e;
        }
    }

    async findById(userId) {
        try {
            return await this.model.findById(userId);
        } catch (e) {
            logger.error("Error while finding user by id", e);
            throw e;
        }
    }

    async findByUsername(username) {
        try {
            return await this.model.findOne({ username });
        } catch (e) {
            logger.error("Error while finding user by username", e);
            throw e;
        }
    }

    async findByEmail(email) {
        try {
            return await this.model.findOne({ email });
        } catch (e) {
            logger.error("Error while finding user by email", e);
            throw e;
        }
    }

    async findAll() {
        try {
            return await this.model.find({isActive: true}).select("-password");
        } catch (e) {
            logger.error("Error while finding all users", e);
            throw e;
        }
    }

}

export default new MongoUserRepository();