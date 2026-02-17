import mongoose from "mongoose";
import config from "./index.js";
import logger from "./logger.js";


//============================
// MongoDB Connection Manager
//============================
class MongoConnection {
    constructor() {
        this.connection = null;
    }

    //==============================================
    // Returns: mongoose.Connection instance/object
    //==============================================
    async connect() {
        try {
            if (this.connection){
                logger.info("MongoDB is already connected");
                return this.connection;
            }

            await mongoose.connect(config.mongo.uri, {
                dbName: config.mongo.dbName
            })
            logger.info(`MongoDB connected: ${config.mongo.uri}`);

            this.connection.on("error", error => {
                logger.error("MongoDB connection error", error);
            })
            this.connection.on("disconnected", () => {
                logger.error("MongoDB disconnected");
            })

            return this.connection;
        } catch (e) {
            logger.error("MongoDB connection failed", e);
            throw e;
        }
    }

    //===============================
    // Disconnect mongoDB connection
    //===============================
    async disconnect() {
        try {
            if (this.connection) {
                await mongoose.disconnect();
                this.connection = null;
                logger.info("MongoDB disconnected")
            }
        } catch (e) {
            logger.error("MongoDB disconnection failed", e);
            throw e;
        }
    }

    //======================================
    // Get mongoDB active connection
    // Returns: mongoose.Connection | null
    //======================================
    getConnection() {
        return this.connection;
    }
}

export default MongoConnection;