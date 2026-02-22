import mongoose from 'mongoose';
import SecurityUtil from '../utils/Security.util.js';



//===================================
// API Key Schema Definition
// Collection: api_keys
// Handles client authentication keys
//===================================
const apiKeySchema = new mongoose.Schema(
    {
        keyId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        keyValue: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            maxlength: 500,
            default: '',
        },
        environment: {
            type: String,
            enum: ['production', 'staging', 'development', 'testing'],
            default: 'production',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        permissions: {
            canIngest: {
                type: Boolean,
                default: true,
            },
            canReadAnalytics: {
                type: Boolean,
                default: false,
            },
            allowedServices: [{
                type: String,
                trim: true,
            }],
        },

        //===================================
        // Security Restrictions
        // IP and Origin Whitelisting
        //===================================
        security: {
            allowedIPs: [{
                type: String,
                validate: {
                    validator: function (v) {
                        return /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/.test(v) ||
                            v === '0.0.0.0/0';
                    },
                    message: 'Invalid IP address format'
                }
            }],
            allowedOrigins: [{
                type: String,
                validate: {
                    validator: function (v) {
                        return /^https?:\/\/[^\s]+$/.test(v) || v === '*';
                    },
                    message: 'Invalid origin format'
                }
            }],
            lastRotated: {
                type: Date,
                default: Date.now,
            },
            rotationWarningDays: {
                type: Number,
                default: 30,
            },
        },

        //===============================================
        // Expiration Date
        // TTL index automatically removes expired keys
        //==============================================
        expiresAt: {
            type: Date,
            default: () => {
                const days = parseInt(process.env.API_KEY_EXPIRY_DAYS || '365');
                return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
            },
            index: true,
        },
        metadata: {
            createdBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            purpose: {
                type: String,
                trim: true,
                maxlength: 200,
            },
            tags: [{
                type: String,
                trim: true,
                maxlength: 50,
            }],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        collection: 'api_keys',
    }
);

//===================================
// Database Indexes
// Optimizes authentication & filtering
//===================================
apiKeySchema.index({ clientId: 1, isActive: 1 });
apiKeySchema.index({ keyValue: 1, isActive: 1 });
apiKeySchema.index({ environment: 1, clientId: 1 });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;