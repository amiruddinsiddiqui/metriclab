import BaseClientRepository from "./BaseClientRepository.js";
import ClientModel from "../../../shared/models/Client.model.js";
import logger from "../../../shared/config/logger.js";


class MongoClientRepository extends BaseClientRepository {
    constructor(model) {
        super(ClientModel);
    }

    /*

    */
    async createClient(clientData) {
        try {
            const client = new this.model(clientData);
            await client.save();

            // await client.populate("createdBy");

            logger.info('Client created in MongoDB', {
                mongoId: client._id,
                slug: client.slug
            });

            return client;
        } catch (e) {
            logger.error('Error creating client in db', e);
            throw e;
        }
    }

    async findById(clientId) {
        try {
            const client = await this.model.findById(clientId);

            logger.info('Client details from MongoDB', client);

            return client;
        } catch (e) {
            logger.error('Error finding client in db by id', e);
            throw e;
        }
    }

    async findBySlug(slug) {
        try {
            return await this.model.findOne({slug});
        } catch (e) {
            logger.error('Error finding client in db by slug', e);
            throw e;
        }
    }

    async find(filters = {}, options = {}) {
        try {
            const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;

            const clients = await this.model.find(filters)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select("-__v");
            return clients;
        } catch (e) {
            logger.error('Error finding clients', e);
            throw e;
        }
    }


    async count(filters = {}) {
        try {
            const count = await this.model.countDocuments(filters);
            return count;
        } catch (e) {
            logger.error('Error counting clients:', e);
            throw e;
        }
    }
}

export default new MongoClientRepository();