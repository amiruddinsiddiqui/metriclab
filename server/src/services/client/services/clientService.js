import AppError from "../../../shared/utils/AppError.js";
import logger from "../../../shared/config/logger.js";
import {APPLICATION_ROLES, isValidClientRole} from "../../../shared/constants/roles.js";
import { v4 as uuidv4 } from "uuid";
import crypto from 'crypto';


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


    generateApiKey() {
        const prefix = "metriclab";
        const randomBytes = crypto.randomBytes(20).toString("hex");
        return `${prefix}_${randomBytes}`;
    }

    /**
     * Create a new API key for a specific client
     * @param {String} clientId - The client ID
     * @param {Object} keyData - The API key data
     * @param {Object} user - The user creating the API key
     * @returns {Object} - The created API key
     */
    async createApikey(clientId, keyData, user){
        try {
            const client = await this.clientRepository.findById(clientId);

            if (!client) {
                throw new AppError("Client not found", 404)
            }

            if (!this.canUserAccessClient(user, clientId)) {
                throw new AppError("Access denied", 403);
            }

            if (!(user.role === APPLICATION_ROLES.SUPER_ADMIN ||
                user.role === APPLICATION_ROLES.CLIENT_ADMIN)) {
                throw new AppError("Access denied - Only Super Admin and Client Admin can create API keys", 403);
            }

            const { name, description, environment = "production" } = keyData;

            const keyId = uuidv4();
            const keyValue = this.generateApiKey();

            const apiKey = await this.apiKeyRepository.create({
                keyId,
                keyValue,
                clientId,
                name,
                description,
                environment,
                createdBy: user.userId
            });

            return apiKey;
        } catch (error) {
            logger.error("Error creating API key", error)
            throw error;
        }
    }


    /**
     * Get all API keys for a specific client
     * @param {String} clientId - The client ID
     * @param {Object} user - The user requesting the API keys
     * @returns {Array} - The list of API keys
     */
    async getClientApiKeys(clientId, user) {
        try {
            if (!this.canUserAccessClient(user, clientId)) {
                throw new AppError('Access denied to this client', 403);
            };

            const apiKeys = await this.apiKeyRepository.findByClientId(clientId);

            const formattedResponse = apiKeys.map(key => {
                const keyObj = key.toObject ? key.toObject() : key;
                delete keyObj.keyValue;
                return keyObj
            })

            return formattedResponse

        } catch (error) {
            logger.error('Error getting client API keys:', error);
            throw error;
        }
    };

    async getClientByApiKey(apiKey) {
        try {
            const key = await this.apiKeyRepository.findByKeyValue(apiKey);

            if (!key) {
                return null;
            }

            if (key.isExpired()) {
                return null;
            }

            // Get the populated client from the key
            const client = key.clientId;

            return {
                client,
                apiKey: key,
            };
        } catch (error) {
            logger.error('Error finding client by API key:', error);
            throw error;
        }
    }
}