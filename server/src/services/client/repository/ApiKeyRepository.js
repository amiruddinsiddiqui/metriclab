import BaseApiKeyRepository from "./BaseApiKeyRepository.js";
import ApiKey from "../../../shared/models/ApiKey.model.js";
import logger from "../../../shared/config/logger.js";

class MongoApiKeyRepository extends BaseApiKeyRepository {
    constructor() {
        super(ApiKey);
    }

    async create(apiKeyData) {
        try {
            const apiKey = new this.model(apiKeyData);
            await apiKey.save();
            logger.info('Client created in MongoDB', {
                keyId: apiKey.keyId
            });

            return apiKey;
        } catch (e) {
            logger.error('Error creating API key in db', e);
            throw e;
        }
    }

    async findByKeyValue(keyValue, includeInactive = false) {
        try {
            const filter = { keyValue };

            if (!includeInactive) {
                filter.isActive = true;
            }

            return await this.model.findOne(filter).populate('clientId');
        } catch (e) {
            logger.error('Error finding API key by value', e);
            throw e;
        }
    }
}

export default new MongoApiKeyRepository();