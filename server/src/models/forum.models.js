import mongoose, { Schema } from 'mongoose';

const forumSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

// Performance: Index for sorting forums by creation date
forumSchema.index({ createdAt: -1 });

export const Forum = mongoose.model('Forum', forumSchema);