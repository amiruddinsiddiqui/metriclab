import mongoose from 'mongoose';


//===================================
// Client Schema Definition
// Collection: clients
// Represents tenant/client entity
//===================================
const clientSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        //===================================
        // Unique Slug Identifier
        // Used for URLs / tenant isolation
        //===================================
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: /^[a-z0-9-]+$/,
        },

        description: {
            type: String,
            maxlength: 500,
            default: '',
        },

        website: {
            type: String,
            default: '',
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        settings: {
            dataRetentionDays: {
                type: Number,
                default: 30,
                min: 7,
                max: 365,
            },
            alertsEnabled: {
                type: Boolean,
                default: true,
            },
            timezone: {
                type: String,
                default: 'UTC',
            },
        },
    },
    {
        timestamps: true,
        collection: 'clients',
    }
);

//===================================
// Database Indexes
// Improves filtering performance
//===================================
clientSchema.index({ isActive: 1 });

const Client = mongoose.model('Client', clientSchema);

export default Client;