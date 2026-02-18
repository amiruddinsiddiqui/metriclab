import pg from 'pg'
import config from "./index.js";
import logger from "./logger.js";


const { Pool } = pg;

class PostgresConnection {
    constructor() {
        this.pool = null;
    }

    getPool() {
        if (!this.pool) {
            this.pool = new Pool({
                host: config.postgres.host,
                port: config.postgres.port,
                database: config.postgres.database,
                user: config.postgres.user,
                password: config.postgres.password,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            })

            this.pool.on("error", error => {
                logger.error("Unexpected error on idle pg client", error);
            })
            logger.info("PG Pool Created Successfully");
        }
        return this.pool;
    }

    async testConnection() {
        try {
            const pool = this.getPool();
            const client = await pool.connect();
            const result = await client.query("SELECT NOW()");
            client.release();

            logger.info(`PG connected successfully at ${result.rows[0].now}`)
        } catch (e) {
            logger.error("PG connection failed", e);
            throw e;
        }
    }

    async query(text, params) {
        const pool = this.getPool();
        const start = Date.now();
        try {
            const result = await pool.query(text, params);
            const duration = Date.now() - start;
            logger.debug("Executed query", { text, duration, rows: result.rowCount });
            return result;
        } catch (e) {
            logger.error("Query Error:", { text, e: e.message })
            throw e;
        }
    }

    async close() {
        try {
            if(this.pool){
                await this.pool.end();
                this.pool = null;
                logger.info("PG Pool closed")
            }
        } catch (e) {
            logger.error("PG Pool failed to close", e);
            throw e;
        }
    }
}

export default new PostgresConnection();