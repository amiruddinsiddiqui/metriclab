import mongoose from "mongoose";
import SecurityUtil from "../utils/Security.util.js";


//===================================
// User Schema Definition
// Collection: users
// Handles auth & RBAC
//===================================
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: 4,
        unique: true,
        trim: true,
        validate: {
            validator: function (username) {
                return /^[a-zA-Z0-9_.]+$/.test(username);
            },
            message: "Please enter valid username",
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (email) {
                return /^[a-zA-Z0-9_.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
            },
            message: "Please enter valid email",
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        validate: {
            validate: function (password) {
                if(this.isModified('password') && password && !password.startWith('$2a$')){
                    const validation = SecurityUtil.validatePassword(password);
                    return validation.success;
                }
                return true;
            },
            message: function ({ value }) {
                if(value && !value.startWith('$2a$')){
                    const validation = SecurityUtil.validatePassword(value);
                    return validation.errors.join(". ");
                }
                return "Password validation failed";
            },
        }
    },

    role: {
        type: String,
        enum: ['super_admin', 'client_admin', 'client_viewer'],
        default: 'client_viewer',
    },

    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: function () {
            return this.role !== 'super_admin';
        }
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    permissions: {
        canManageUsers: {
            type: Boolean,
            default: false,
        },
        canCreateAPIKey: {
            type: Boolean,
            default: false,
        },
        canViewAnalytics: {
            type: Boolean,
            default: true,
        },
        canExportData: {
            type: Boolean,
            default: false,
        },
    }
}, {
    timestamps: true,
    collection: "users"
})


//===================================
// Pre-Save Middleware
// Hash password before saving
//===================================
userSchema.pre('save', async function (next) {

    // Skip if password not modified
    if(!this.isModified('password')) {
        return next();
    }

    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.has(this.password, salt);
        next();
    } catch (e) {
        next(e);
    }
});

//===================================
// Database indexes
// Improve query performance
//===================================
userSchema.index({ clientId: 1, isActive: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

export default User;