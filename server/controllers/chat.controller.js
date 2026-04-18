import formidable from 'formidable';
import fs from 'fs';

import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import User from '../models/user.model';
import errorHandler from '../helpers/dbErrorHandler';

/**
 * Create a new conversation (1:1 or group)
 */
const createConversation = async (req, res) => {
    try {
        const { participants, isGroup, groupName } = req.body;
        const userId = req.auth._id;

        // Ensure creator is in participants
        if (!participants.includes(userId.toString())) {
            participants.push(userId.toString());
        }

        // For 1:1 chats, check if conversation already exists
        if (!isGroup && participants.length === 2) {
            const existing = await Conversation.findOne({
                isGroup: false,
                participants: { $all: participants, $size: 2 }
            }).populate('participants', '_id name email photo online lastSeen')
              .populate('lastMessage');

            if (existing) {
                return res.json(existing);
            }
        }

        // Validate group requirements
        if (isGroup && (!groupName || groupName.trim() === '')) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        const conversation = new Conversation({
            participants,
            isGroup: isGroup || false,
            groupName: isGroup ? groupName : undefined,
            admin: isGroup ? userId : undefined
        });

        let result = await conversation.save();
        result = await Conversation.findById(result._id)
            .populate('participants', '_id name email photo online lastSeen');

        return res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
};

/**
 * List all conversations for a user, sorted by latest activity
 */
const listConversations = async (req, res) => {
    try {
        const userId = req.params.userId;

        const conversations = await Conversation.find({
            participants: userId
        })
            .populate('participants', '_id name email photo online lastSeen')
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: '_id name'
                }
            })
            .sort({ updatedAt: -1 });

        // Attach unread counts
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.countDocuments({
                    conversation: conv._id,
                    sender: { $ne: userId },
                    isDeleted: false,
                    'readBy.user': { $ne: userId }
                });
                const convObj = conv.toObject();
                convObj.unreadCount = unreadCount;
                return convObj;
            })
        );

        return res.json(conversationsWithUnread);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
};

/**
 * Get messages for a conversation with cursor-based pagination
 */
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { before, limit = 50 } = req.query;
        const userId = req.auth._id;

        // Verify user is a participant
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId
        });

        if (!conversation) {
            return res.status(403).json({ error: 'Access denied' });
        }

        let query = { conversation: conversationId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .populate('sender', '_id name photo')
            .populate('readBy.user', '_id name')
            .populate('reactions.user', '_id name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        return res.json(messages.reverse());
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
};

/**
 * Send a message (text or with media attachment)
 */
const sendMessage = async (req, res) => {
    try {
        const userId = req.auth._id;
        let messageData = {};

        // Check if multipart (file upload) or JSON
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('multipart/form-data')) {
            const form = formidable({});
            const [fields, files] = await form.parse(req);

            messageData.conversation = fields.conversation ? fields.conversation[0] : undefined;
            messageData.content = fields.content ? fields.content[0] : '';
            messageData.messageType = fields.messageType ? fields.messageType[0] : 'text';

            if (files.media) {
                const file = Array.isArray(files.media) ? files.media[0] : files.media;
                messageData.media = {
                    data: fs.readFileSync(file.filepath),
                    contentType: file.mimetype,
                    fileName: file.originalFilename,
                    fileSize: file.size
                };
                if (!messageData.messageType || messageData.messageType === 'text') {
                    messageData.messageType = file.mimetype.startsWith('image/') ? 'image' : 'file';
                }
            }
        } else {
            messageData = req.body;
        }

        // Verify user is a participant
        const conversation = await Conversation.findOne({
            _id: messageData.conversation,
            participants: userId
        });

        if (!conversation) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const message = new Message({
            conversation: messageData.conversation,
            sender: userId,
            content: messageData.content,
            messageType: messageData.messageType || 'text',
            media: messageData.media,
            readBy: [{ user: userId }]
        });

        let result = await message.save();

        // Update conversation's lastMessage
        conversation.lastMessage = result._id;
        await conversation.save();

        result = await Message.findById(result._id)
            .populate('sender', '_id name photo')
            .populate('readBy.user', '_id name');

        // Emit socket event to all participants in the conversation room
        const io = req.app.get('io');
        if (io) {
            io.to(`conversation:${messageData.conversation}`).emit('new_message', result);

            // Notify participants not in the room
            conversation.participants.forEach(participantId => {
                const pid = participantId.toString();
                if (pid !== userId.toString()) {
                    io.to(`user:${pid}`).emit('notification', {
                        type: 'new_message',
                        conversation: messageData.conversation,
                        message: result
                    });
                }
            });
        }

        return res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
};

/**
 * Edit a message (only by sender)
 */
const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.auth._id;
        const { content } = req.body;

        const message = await Message.findOne({
            _id: messageId,
            sender: userId,
            isDeleted: false
        });

        if (!message) {
            return res.status(403).json({ error: 'Cannot edit this message' });
        }

        message.content = content;
        message.isEdited = true;
        await message.save();

        const result = await Message.findById(messageId)
            .populate('sender', '_id name photo')
            .populate('readBy.user', '_id name')
            .populate('reactions.user', '_id name');

        return res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
};

/**
 * Soft-delete a message (only by sender)
 */
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.auth._id;

        const message = await Message.findOne({
            _id: messageId,
            sender: userId
        });

        if (!message) {
            return res.status(403).json({ error: 'Cannot delete this message' });
        }

        message.isDeleted = true;
        message.content = '';
        message.media = undefined;
        await message.save();

        return res.json({ messageId, deleted: true });
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
};

/**
 * Toggle reaction on a message
 */
const reactToMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.auth._id;
        const { emoji } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
            r => r.user.toString() === userId.toString() && r.emoji === emoji
        );

        if (existingReaction) {
            // Remove the reaction (toggle off)
            message.reactions = message.reactions.filter(
                r => !(r.user.toString() === userId.toString() && r.emoji === emoji)
            );
        } else {
            // Add reaction
            message.reactions.push({ user: userId, emoji });
        }

        await message.save();

        const result = await Message.findById(messageId)
            .populate('sender', '_id name photo')
            .populate('reactions.user', '_id name');

        return res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
};

/**
 * Mark all messages in a conversation as read
 */
const markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.auth._id;

        await Message.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: userId },
                'readBy.user': { $ne: userId }
            },
            {
                $push: { readBy: { user: userId, readAt: new Date() } }
            }
        );

        return res.json({ success: true });
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
};

/**
 * Update group conversation info
 */
const updateGroup = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.auth._id;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            admin: userId,
            isGroup: true
        });

        if (!conversation) {
            return res.status(403).json({ error: 'Only admin can update group' });
        }

        // Handle group photo upload
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('multipart/form-data')) {
            const form = formidable({});
            const [fields, files] = await form.parse(req);

            if (fields.groupName) conversation.groupName = fields.groupName[0];
            if (files.groupPhoto) {
                const photo = Array.isArray(files.groupPhoto) ? files.groupPhoto[0] : files.groupPhoto;
                conversation.groupPhoto.data = fs.readFileSync(photo.filepath);
                conversation.groupPhoto.contentType = photo.mimetype;
            }
        } else {
            if (req.body.groupName) conversation.groupName = req.body.groupName;
        }

        await conversation.save();
        const result = await Conversation.findById(conversationId)
            .populate('participants', '_id name email photo online lastSeen');

        return res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
};

/**
 * Add/remove participants from a group conversation
 */
const updateParticipants = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.auth._id;
        const { action, participantId } = req.body;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            isGroup: true,
            participants: userId
        });

        if (!conversation) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Only admin can add/remove, or user can remove themselves
        const isAdmin = conversation.admin.toString() === userId.toString();
        const isSelf = participantId === userId.toString();

        if (!isAdmin && !isSelf) {
            return res.status(403).json({ error: 'Only admin can manage participants' });
        }

        if (action === 'add') {
            if (!conversation.participants.includes(participantId)) {
                conversation.participants.push(participantId);
            }
        } else if (action === 'remove') {
            conversation.participants = conversation.participants.filter(
                p => p.toString() !== participantId
            );
        }

        await conversation.save();
        const result = await Conversation.findById(conversationId)
            .populate('participants', '_id name email photo online lastSeen');

        return res.json(result);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
};

/**
 * Get media for a message (image/file download)
 */
const getMessageMedia = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message || !message.media || !message.media.data) {
            return res.status(404).json({ error: 'Media not found' });
        }

        res.set('Content-Type', message.media.contentType);
        if (message.messageType === 'file') {
            res.set('Content-Disposition', `attachment; filename="${message.media.fileName}"`);
        }
        return res.send(message.media.data);
    } catch (err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        });
    }
};

export default {
    createConversation,
    listConversations,
    getMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    markAsRead,
    updateGroup,
    updateParticipants,
    getMessageMedia
};
