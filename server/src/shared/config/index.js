// global level configs

import dotenv from 'dotenv'

dotenv.config();

const config = {
    // server
    node_env : process.env.NODE_ENV || "development",
    port : parseInt(process.env.PORT || "5000", 10),

    // mongoDB
    mongo: {
        uri: process.env.MONGO_URI || "mongodb://localhost:27017/api_monitoring",
        dbName: process.env.MONGO_DB_NAME || "api_monitoring",
    },

    // postgreSQL
    postgres: {
        host: process.env.PG_HOST || "localhost",
        port: parseInt(process.env.PG_PORT || "5432", 10),
        database: process.env.PG_DATABASE || "api_monitoring",
        user: process.env.PG_USER || "postgres",
        password: process.env.PG_PASSWORD || "postgres",
    },

    // rabbitMQ
    rabbitmq: {
        url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
        queue: process.env.RABBITMQ_QUEUE || "api_hits",
        publisherConfirms: process.env.RABBITMQ_PUBLISHER_CONFIRMS === 'true' || false,
        retryAttempts: parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || '3', 10),
        retryDelay: parseInt(process.env.RABBITMQ_RETRY_DELAY || '1000', 10),
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || "womp!@#$womp12345",
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), //15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10), // 1000 req per 15 min per IP address
    },
}

export default config;