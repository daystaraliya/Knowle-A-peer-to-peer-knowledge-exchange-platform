import mongoose, { Schema } from 'mongoose';

const disputeSchema = new Schema({
    relatedExchange: { type: Schema.Types.ObjectId, ref: 'Exchange', required: true },
    complainant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    respondent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['open', 'under_review', 'resolved'],
        default: 'open'
    },
    resolution: { type: String },
    assignee: { // The support agent handling the ticket
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    assignedAt: { type: Date }
}, { 
    timestamps: true,
    collection: 'disputes'
});

const disputeMessageSchema = new Schema({
    dispute: { type: Schema.Types.ObjectId, ref: 'Dispute', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    isSupportMessage: { type: Boolean, default: false }
}, { 
    timestamps: true,
    collection: 'disputemessages'
});

export const Dispute = mongoose.model('Dispute', disputeSchema);
export const DisputeMessage = mongoose.model('DisputeMessage', disputeMessageSchema);
