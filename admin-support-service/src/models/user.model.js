import mongoose, { Schema } from 'mongoose';

// A simplified schema for the admin service to interact with the Users collection.
// It only includes the fields necessary for admin operations.
const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    fullName: { type: String, required: true },
    role: {
        type: String,
        enum: ['user', 'mentor', 'support', 'admin'],
        default: 'user'
    },
    accountStatus: {
        type: String,
        enum: ['active', 'warned', 'suspended', 'banned'],
        default: 'active'
    },
}, { 
    timestamps: true,
    // Important: Use the same collection name as the main server
    collection: 'users' 
});

export const User = mongoose.model('User', userSchema);
