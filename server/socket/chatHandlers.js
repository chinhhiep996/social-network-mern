import Message from '../models/message.model';
import Conversation from '../models/conversation.model';
import User from '../models/user.model';

/**
 * Register all chat-related socket event handlers
 */
const registerChatHandlers = (io, socket) => {
    const userId = socket.userId;

    /**
     * Join a conversation room
     */
    socket.on('join_conversation', (conversationId) => {
        socket.join(`conversation:${conversationId}`);
    });

    /**
     * Leave a conversation room
     */
    socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conversation:${conversationId}`);
    });

    /**
     * Send a new message via WebSocket (text only — media goes through REST)
     */
    socket.on('send_message', async (data, callback) => {
        try {
            const { conversationId, content, messageType = 'text' } = data;

            // Verify participant
            const conversation = await Conversation.findOne({
                _id: conversationId,
                participants: userId
            });

            if (!conversation) {
                return callback?.({ error: 'Access denied' });
            }

            const message = new Message({
                conversation: conversationId,
                sender: userId,
                content,
                messageType,
                readBy: [{ user: userId }]
            });

            let result = await message.save();

            // Update conversation lastMessage
            conversation.lastMessage = result._id;
            await conversation.save();

            result = await Message.findById(result._id)
                .populate('sender', '_id name photo')
                .populate('readBy.user', '_id name');

            // Broadcast to conversation room
            io.to(`conversation:${conversationId}`).emit('new_message', result);

            // Send notifications to participants who are NOT in the room
            const room = io.sockets.adapter.rooms.get(`conversation:${conversationId}`);
            const roomSocketIds = room ? Array.from(room) : [];
            
            conversation.participants.forEach(participantId => {
                const pid = participantId.toString();
                if (pid !== userId) {
                    // Check if participant has a socket but is not in the conversation room
                    const participantRoom = io.sockets.adapter.rooms.get(`user:${pid}`);
                    if (participantRoom) {
                        io.to(`user:${pid}`).emit('notification', {
                            type: 'new_message',
                            conversation: conversationId,
                            message: result
                        });
                    }
                }
            });

            callback?.({ success: true, message: result });
        } catch (err) {
            callback?.({ error: err.message });
        }
    });

    /**
     * Typing indicator
     */
    socket.on('typing', (data) => {
        const { conversationId } = data;
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
            conversationId,
            userId,
            isTyping: true
        });
    });

    socket.on('stop_typing', (data) => {
        const { conversationId } = data;
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
            conversationId,
            userId,
            isTyping: false
        });
    });

    /**
     * Mark messages as read
     */
    socket.on('message_read', async (data) => {
        try {
            const { conversationId } = data;

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

            socket.to(`conversation:${conversationId}`).emit('messages_read', {
                conversationId,
                userId
            });
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    });

    /**
     * Edit a message
     */
    socket.on('edit_message', async (data, callback) => {
        try {
            const { messageId, content, conversationId } = data;

            const message = await Message.findOne({
                _id: messageId,
                sender: userId,
                isDeleted: false
            });

            if (!message) {
                return callback?.({ error: 'Cannot edit this message' });
            }

            message.content = content;
            message.isEdited = true;
            await message.save();

            const result = await Message.findById(messageId)
                .populate('sender', '_id name photo')
                .populate('reactions.user', '_id name');

            io.to(`conversation:${conversationId}`).emit('message_edited', result);
            callback?.({ success: true });
        } catch (err) {
            callback?.({ error: err.message });
        }
    });

    /**
     * Delete a message
     */
    socket.on('delete_message', async (data, callback) => {
        try {
            const { messageId, conversationId } = data;

            const message = await Message.findOne({
                _id: messageId,
                sender: userId
            });

            if (!message) {
                return callback?.({ error: 'Cannot delete this message' });
            }

            message.isDeleted = true;
            message.content = '';
            message.media = undefined;
            await message.save();

            io.to(`conversation:${conversationId}`).emit('message_deleted', {
                messageId,
                conversationId
            });
            callback?.({ success: true });
        } catch (err) {
            callback?.({ error: err.message });
        }
    });

    /**
     * React to a message
     */
    socket.on('react_message', async (data, callback) => {
        try {
            const { messageId, emoji, conversationId } = data;

            const message = await Message.findById(messageId);
            if (!message) {
                return callback?.({ error: 'Message not found' });
            }

            const existingReaction = message.reactions.find(
                r => r.user.toString() === userId && r.emoji === emoji
            );

            if (existingReaction) {
                message.reactions = message.reactions.filter(
                    r => !(r.user.toString() === userId && r.emoji === emoji)
                );
            } else {
                message.reactions.push({ user: userId, emoji });
            }

            await message.save();

            const result = await Message.findById(messageId)
                .populate('sender', '_id name photo')
                .populate('reactions.user', '_id name');

            io.to(`conversation:${conversationId}`).emit('message_reacted', result);
            callback?.({ success: true });
        } catch (err) {
            callback?.({ error: err.message });
        }
    });
};

export default registerChatHandlers;
