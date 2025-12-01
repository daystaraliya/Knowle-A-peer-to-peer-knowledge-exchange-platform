import mongoose, { Schema } from 'mongoose';

const disputeSchema = new Schema({
    relatedExchange: {
        type: Schema.Types.ObjectId,
        ref: 'Exchange',
        required: true,
        index: true,
    },
    complainant: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    respondent: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    reason: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['open', 'under_review', 'resolved'],
        default: 'open',
        index: true,
    },
    resolution: { // To be filled in by an admin upon resolution
        type: String,
    }
}, { timestamps: true });

const disputeMessageSchema = new Schema({
    dispute: {
        type: Schema.Types.ObjectId,
        ref: 'Dispute',
        required: true,
        index: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // Author is not required for an automated support message
        required: function() { return !this.isSupportMessage; },
    },
    content: {
        type: String,
        required: true,
    },
    isSupportMessage: {
        type: Boolean,
        default: false, // Differentiates messages from platform support/admins
    }
}, { timestamps: true });

export const Dispute = mongoose.model('Dispute', disputeSchema);
export const DisputeMessage = mongoose.model('DisputeMessage', disputeMessageSchema);