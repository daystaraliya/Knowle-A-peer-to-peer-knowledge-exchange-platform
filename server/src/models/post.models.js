import mongoose, { Schema } from 'mongoose';

const postSchema = new Schema({
    forum: {
        type: Schema.Types.ObjectId,
        ref: 'Forum',
        required: true,
        index: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentPost: { // If this exists, it's a reply
        type: Schema.Types.ObjectId,
        ref: 'Post',
        default: null
    },
    title: { // Required for top-level posts, optional for replies
        type: String,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    replyCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Middleware to validate that a top-level post has a title
postSchema.pre('save', function(next) {
    if (!this.parentPost && !this.title) {
        next(new Error('A top-level post must have a title.'));
    } else {
        next();
    }
});

// Index for efficiently fetching posts and replies for a forum, sorted by creation time
postSchema.index({ forum: 1, parentPost: 1, createdAt: -1 });

export const Post = mongoose.model('Post', postSchema);