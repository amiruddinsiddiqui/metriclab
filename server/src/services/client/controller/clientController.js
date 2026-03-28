import ResponseFormatter from "../../../shared/utils/responseFormatter.js";


export class ClientController {
    constructor(clientService, authService) {
        if (!clientService) {
            throw new Error("ClientService is required")
        }
        if (!authService) {
            throw new Error("AuthService is required")
        }

        this.clientService = clientService;
        this.authService = authService;
    }

    async createClient(req, res, next) {
        try {
            const isSuperAdmin = await this.authService.checkSuperAdminPermissions(req.user.userId);
            if (!isSuperAdmin) {
                return res.status(403).json(ResponseFormatter.error("Access denied", 403));
            }

            const client = await this.clientService.createClient(req.body, req.user);
            return res.status(201).json(ResponseFormatter.success("Client created successfully", client, 201));
        } catch (e) {
            next(e);
        }
    }

    async createClientUser(req, res, next){
        try {
            const { clientId } = req.params;
            const user = await this.clientService.createClientUser(clientId, req.body, req.user);
            return res.status(201).json(ResponseFormatter.success(user, "Client created successfully", 201));
        } catch (e) {
            next(e);
        }
    }

    async createApiKey(req, res, next){
        try {
            const { clientId } = req.params;
            const apiKey = await this.clientService.createApikey(clientId, req.body, req.user);
            return res.status(201).json(ResponseFormatter.success(apiKey, "API key created successfully", 201));
        } catch (e) {
            next(e);
        }
    }


    /**
     * Get all API keys for a specific client
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     * @param {Function} next - Express next function for error handling
     * @returns {Promise<Response>} - JSON response with fetched API keys data or error message
     */
    async getClientApiKey(req, res, next) {
        try {
            const { clientId } = req.params;
            const apiKey = await this.clientService.getClientApiKeys(clientId, req.user)
            return res.status(200).json(ResponseFormatter.success(apiKey, "API key fetched successfully", 200))
        } catch (error) {
            next(error)
        }
    }
}