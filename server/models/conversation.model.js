import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    isGroup: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
        trim: true
    },
    groupPhoto: {
        data: Buffer,
        contentType: String
    },
    admin: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    lastMessage: {
        type: mongoose.Schema.ObjectId,
        ref: 'Message'
    }
}, {
    timestamps: true
});

// Index for fast participant lookup
ConversationSchema.index({ participants: 1 });
// Index for sorting by latest activity
ConversationSchema.index({ updatedAt: -1 });

export default mongoose.model('Conversation', ConversationSchema);
