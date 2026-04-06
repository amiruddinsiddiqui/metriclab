import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './shared/config/index.js';
import logger from './shared/config/logger.js';
import postgres from './shared/config/postgres.js';
import rabbitmq from './shared/config/rabbitmq.js';
import errorHandler from './shared/middlewares/errorHandler.middleware.js';
import ResponseFormatter from './shared/utils/responseFormatter.js';
import errorHandlerMiddleware from "./shared/middlewares/errorHandler.middleware.js";
import MongoConnection from "./shared/config/mongodb.js";
import cookieParser from "cookie-parser";

import authRouter from "./services/auth/routes/auth.router.js";
import clientRouter from "./services/client/routes/clientRoutes.js"

const mongodb = new MongoConnection();

// Initialize Express app
const app = express();

// middlewares
app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    });
    next();
})


// health check
app.get('/health', (req, res) => {
    res.status(200).json(
        ResponseFormatter.success(
            {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            },
            'Service is healthy',
        )
    )
});

app.get('/', (req, res) => {
    res.status(200).json(
        ResponseFormatter.success(
            {
                service: 'API Hit Monitoring System',
                version: '1.0.0',
                endpoint: {
                    health: '/health',
                    auth: '/api/auth',
                    ingest: '/api/hit',
                    analytics: '/api/analytics',
                },
            },
            'API Hit Monitoring Service'
        )
    )
})


app.use("/api/auth", authRouter);
app.use("/api", clientRouter)


app.use((req, res) => {
    res.status(404).json(ResponseFormatter.error('Endpoint not found', 404))
})

app.use(errorHandlerMiddleware)


async function initializeConnection() {
    try {
        logger.info('Initializing all connections...');

        await mongodb.connect();

        await postgres.testConnection();

        await rabbitmq.connect();

        logger.info('All connections established successfully');
    } catch (e) {
        logger.error('Failed to establish connections', e);
        throw e;
    }
}


const startServer = async () => {
    try {
        await initializeConnection();

        const server = app.listen(config.port, () => {
            logger.info(`Server listening on port ${config.port}`);
            logger.info(`Environment: ${config.node_env}`);
            logger.info(`API available at: http://localhost:${config.port}`);
        });

        const gracefulShutdown = async (signal) => {
            logger.info(`${signal} received, shutting down gracefully...`);

            server.close(async () => {
                logger.info("HTTP server closed");
                
                try {
                    await mongodb.disconnect();
                    await postgres.close();
                    await rabbitmq.close();
                    logger.info('All connection closed, exiting process');
                    process.exit(0);
                } catch (e) {
                    logger.info('Error occurred during shutdown:',e);
                    process.exit(1);
                }
            });

            setTimeout(() => {
                logger.error('Forced shutdown');
                process.exit(1);
            }, 10000);
        }

        process.on("SIGTERM", () => gracefulShutdown("SIGTERM")); // SIGTERM -> signal terminate
        process.on("SIGINT", () => gracefulShutdown("SIGINT")); // SIGINT -> signal interrupt

        process.on("uncaughtException", (error) => {
            logger.error("Uncaught Exception", error)
            gracefulShutdown("uncaughtException");
        });

        process.on("unhandledRejection", (reason, promise) => {
            logger.error("Unhandled Rejection at:", promise, "reason:", reason);
            gracefulShutdown("unhandledRejection");
        });
    } catch (e) {
        logger.info(`Failed to start server`, e);
        process.exit(1);
    }
}


await startServer();