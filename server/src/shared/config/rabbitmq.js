import amqp from 'amqplib';
import config from "./index.js";
import logger from "./logger.js";



//=============================
// RabbitMQ Connection Manager
//=============================
class RabbitMQConnection {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnecting = false;
    }

    //===================================
    // Establish RabbitMQ connection
    // Returns: amqp.Channel
    //===================================
    async connect() {

        // channel already exists, reuse it
        if(this.channel){
            return this.channel;
        }

        // connection is in progress, wait until finished
        if(this.isConnecting){
            await new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    // connection finishes, stop waiting
                    if(!this.isConnecting){
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100)
            });
            return this.channel;
        }

        try {
            this.isConnecting = true;

            logger.info("Connecting to RabbitMQ", config.rabbitmq.url);
            this.connection = await amqp.connect(config.rabbitmq.url);
            this.channel = await this.connection.createChannel();

            // Key & Queue name
            const dlqName = `${config.rabbitmq.queue}.dlq`;

            // Declare Dead Letter Queue (DLQ)
            await this.channel.assertQueue(dlqName, {
                durable: true,
            })

            // Declare main/normal Queue with DLQ binding
            await this.channel.assertQueue(config.rabbitmq.queue, {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': '', // default x-change
                    'x-dead-letter-routing-key': dlqName,
                }
            })

            logger.info('RabbitMQ connected, queue:', config.rabbitmq.queue);

            // handle unexpected connection close
            this.connection.on('close', () => {
                logger.warn('RabbitMQ connection closed');
                this.connection = null;
                this.channel = null;
            })

            // handle connection-level errors
            this.connection.on('error', (e) => {
                logger.error('RabbitMQ connection error',e);
                this.connection = null;
                this.channel = null;
            })

            this.isConnecting = false;

            return this.channel;
        } catch (e) {
            this.isConnecting = false;
            logger.error('Failed to connect to RabbitMQ', e);
            throw e;
        }
    }

    //====================================
    // Get active RabbitMQ channel
    // Returns: amqp.Channel | null
    //====================================
    getChannel() {
        return this.channel;
    }

    //====================================================
    // Get current RabbitMQ connection status
    // Returns: "connected" | "closing" | "disconnected"
    //===================================================
    getStatus() {
        if(!this.connect || !this.channel) return "disconnected";
        if(this.connect.closing) return "closing";
        return "connected";
    }

    //================================================
    // Gracefully close RabbitMQ connection & channel
    //================================================
    async close(){
        try {
            if(this.channel){
                await this.channel.close();
                this.channel = null;
            }
            if(this.connection){
                await this.connection.close();
                this.connection = null;
            }
            logger.info('RabbitMQ connection closed');
        } catch (e) {
            logger.error('Error occured while closing RabbitMQ connection', e);
            throw e;
        }
    }
}

export default new RabbitMQConnection();