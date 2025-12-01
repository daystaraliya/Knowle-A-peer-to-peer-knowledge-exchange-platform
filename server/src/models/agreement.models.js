import mongoose, { Schema } from 'mongoose';

const agreementSchema = new Schema({
    proposer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'cancelled'],
        default: 'pending'
    },
    learningObjectives: {
        type: [String],
        required: true,
        validate: [v => v.length > 0, 'At least one learning objective is required.']
    },
    proposedDuration: { // in minutes
        type: Number,
        required: true
    },
    // The topics are essential for creating the exchange later
    topicToLearn: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    topicToTeach: {
        type: Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    // This field will be populated once the agreement is accepted and the exchange is created
    relatedExchange: {
        type: Schema.Types.ObjectId,
        ref: 'Exchange'
    }
}, { timestamps: true });

// Indexes for efficiently querying a user's agreements
agreementSchema.index({ proposer: 1, status: 1 });
agreementSchema.index({ receiver: 1, status: 1 });

export const Agreement = mongoose.model('Agreement', agreementSchema);