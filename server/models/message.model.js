import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        trim: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    media: {
        data: Buffer,
        contentType: String,
        fileName: String,
        fileSize: Number
    },
    readBy: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            },
            readAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    reactions: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            },
            emoji: {
                type: String,
                required: true
            }
        }
    ],
    isEdited: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for efficient message pagination per conversation
MessageSchema.index({ conversation: 1, createdAt: -1 });

export default mongoose.model('Message', MessageSchema);
