import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";
import {APPLICATION_ROLES, isValidClientRole} from "../../../shared/constants/roles.js";


export class ClientService {
    constructor(dependencies) {
        if (!dependencies) {
            throw new Error("Dependencies are required");
        }

        if (!dependencies.clientRepository) {
            throw new Error("ClientRepository is required");
        }

        if (!dependencies.apiKeyRepository) {
            throw new Error("ApiKeyRepository is required");
        }

        if (!dependencies.userRepository) {
            throw new Error("UserRepository is required");
        }

        this.clientRepository = dependencies.clientRepository;
        this.apiKeyRepository = dependencies.apiKeyRepository;
        this.userRepository = dependencies.userRepository
    }


    formatClientForResponse(user) {
        const userObj = user.toObject ? user.toObject() : {...user};
        delete userObj.password;
        return userObj;
    }

    /*
    * Generate unique slug using name
    * @param {String} name
    * @returns {String}
    */
    generateSlug(name){
        return name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, "-")
            .replace(/-+/g, '-')
            .trim();
    }

    async createClient(clientData, adminUser) {
        try {
            const { name, email, description, website } = clientData;
            const slug = this.generateSlug(name);

            const existingClient = await this.clientRepository.findBySlug(slug);
            if (existingClient) {
                throw new AppError(`Client with slug ${slug} exists`, 400);
            }

            const client = await this.clientRepository.createClient({
                name,
                slug,
                email,
                description,
                website,
                createdBy : adminUser.userId
            });

            return client;
        } catch (e) {
            logger.error("Error creating client", e);
            throw e;
        }
    }

    canUserAccessClient(user, clientId) {
        if (user.role === APPLICATION_ROLES.SUPER_ADMIN) {
            return true
        }
        return user.clientId && user.clientId.toString() === clientId.toString()
    }

    async createClientUser(clientId, userData, adminUser) {
        try {
            if (!this.canUserAccessClient(adminUser, clientId)) {
                throw new AppError("Access denied", 403);
            }

            const { username, email, password, role = APPLICATION_ROLES.CLIENT_VIEWER } = userData;

            if (!isValidClientRole(role)) {
                throw new AppError("Invalid role for client user", 400);
            }
            const client = this.clientRepository.findById(clientId);

            if (!client) {
                throw new AppError("Client not found", 404)
            }
            let permissions = {
                canCreateApiKeys: false,
                canManageUsers: false,
                canViewAnalytics: true,
                canExportData: false,
            };

            if (role === APPLICATION_ROLES.CLIENT_ADMIN) {
                permissions = {
                    canCreateApiKeys: true,
                    canManageUsers: true,
                    canViewAnalytics: true,
                    canExportData: true,
                };
            }

            const user = await this.userRepository.create({
                username,
                email,
                password,
                role,
                clientId,
                permissions,
            });

            logger.info("Client user created", {
                clientId,
                userId: user._id,
                role
            })
            return this.formatClientForResponse(user);
        } catch (e) {
            logger.error("Error creating client user", e);
            throw e;
        }
    }
}