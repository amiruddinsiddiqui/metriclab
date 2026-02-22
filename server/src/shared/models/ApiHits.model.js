import mongoose from 'mongoose';



//===================================
// API Hit Schema Definition
// Collection: api_hits
// Stores API usage & analytics logs
//===================================
const apiHitSchema = new mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        timestamp: {
            type: Date,
            required: true,
        },
        serviceName: {
            type: String,
            required: true,
            index: true,
        },
        endpoint: {
            type: String,
            required: true,
            index: true,
        },
        method: {
            type: String,
            required: true,
            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        },
        statusCode: {
            type: Number,
            required: true,
            index: true,
        },
        latencyMs: {
            type: Number,
            required: true,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
            index: true,
        },
        apiKeyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ApiKey',
            required: true,
            index: true,
        },
        ip: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
        collection: 'api_hits',
    }
);

//===================================
// Compound Indexes
// Optimized for analytics queries
//===================================
apiHitSchema.index({ clientId: 1, serviceName: 1, endpoint: 1, timestamp: -1 });
apiHitSchema.index({ clientId: 1, timestamp: -1, statusCode: 1 });
apiHitSchema.index({ apiKeyId: 1, timestamp: -1 });

//===================================
// TTL Index (30 Days Retention)
// Automatically deletes old logs
// 2592000 seconds = 30 days
//===================================
apiHitSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

const ApiHit = mongoose.model('ApiHit', apiHitSchema);

export default ApiHit;