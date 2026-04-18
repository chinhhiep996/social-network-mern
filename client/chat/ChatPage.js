import React, { useState, useEffect, useCallback, useRef } from 'react';
import auth from '../auth/auth-helper';
import { getSocket } from './socket';
import { listConversations, getMessages, sendMessage as sendMessageAPI, markAsRead } from './api-chat';
import ConversationList from './ConversationList';
import ChatHeader from './ChatHeader';
import MessageArea from './MessageArea';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import NewChatDialog from './NewChatDialog';
import GroupChatDialog from './GroupChatDialog';
import './chat.css';

const ChatPage = () => {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [typingUsers, setTypingUsers] = useState({});
    const [showNewChat, setShowNewChat] = useState(false);
    const [showGroupSettings, setShowGroupSettings] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState({});

    const jwt = auth.isAuthenticated();
    const currentUserId = jwt?.user?._id;
    const socketRef = useRef(null);
    const activeConvRef = useRef(null);

    // Keep ref in sync
    useEffect(() => {
        activeConvRef.current = activeConversation;
    }, [activeConversation]);

    // ─── Load conversations ───────────────────────────────
    const loadConversations = useCallback(async () => {
        if (!jwt) return;
        const data = await listConversations({ userId: currentUserId }, { t: jwt.token });
        if (data && !data.error) {
            setConversations(data);
        }
    }, [currentUserId, jwt?.token]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // ─── Socket.IO setup ──────────────────────────────────
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        socketRef.current = socket;

        // New message handler
        socket.on('new_message', (message) => {
            const convId = message.conversation?._id || message.conversation;

            // Add to messages if in the active conversation
            if (activeConvRef.current?._id === convId) {
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.find(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
            }

            // Update conversation list
            setConversations(prev => {
                const updated = prev.map(c => {
                    if (c._id === convId) {
                        return {
                            ...c,
                            lastMessage: message,
                            updatedAt: message.createdAt,
                            unreadCount: activeConvRef.current?._id === convId
                                ? c.unreadCount
                                : (c.unreadCount || 0) + 1
                        };
                    }
                    return c;
                });
                // Sort by latest
                return updated.sort((a, b) =>
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                );
            });
        });

        // Notification for messages in other conversations
        socket.on('notification', (data) => {
            if (data.type === 'new_message') {
                loadConversations();
            }
        });

        // Typing indicator
        socket.on('user_typing', (data) => {
            setTypingUsers(prev => ({
                ...prev,
                [data.userId]: { isTyping: data.isTyping, name: data.userName }
            }));

            // Auto-clear after 3 seconds
            if (data.isTyping) {
                setTimeout(() => {
                    setTypingUsers(prev => ({
                        ...prev,
                        [data.userId]: { ...prev[data.userId], isTyping: false }
                    }));
                }, 3000);
            }
        });

        // Read receipts
        socket.on('messages_read', (data) => {
            if (activeConvRef.current?._id === data.conversationId) {
                setMessages(prev => prev.map(msg => {
                    const alreadyRead = msg.readBy?.some(r =>
                        (r.user?._id || r.user) === data.userId
                    );
                    if (!alreadyRead && (msg.sender?._id || msg.sender) === currentUserId) {
                        return {
                            ...msg,
                            readBy: [...(msg.readBy || []), { user: data.userId, readAt: new Date() }]
                        };
                    }
                    return msg;
                }));
            }
        });

        // Message edited
        socket.on('message_edited', (updated) => {
            setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
        });

        // Message deleted
        socket.on('message_deleted', (data) => {
            setMessages(prev => prev.map(m =>
                m._id === data.messageId ? { ...m, isDeleted: true, content: '' } : m
            ));
        });

        // Message reacted
        socket.on('message_reacted', (updated) => {
            setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
        });

        // Online/offline status
        socket.on('user_online', (data) => {
            setOnlineUsers(prev => ({ ...prev, [data.userId]: true }));
            updateConversationParticipantStatus(data.userId, true, data.lastSeen);
        });

        socket.on('user_offline', (data) => {
            setOnlineUsers(prev => ({ ...prev, [data.userId]: false }));
            updateConversationParticipantStatus(data.userId, false, data.lastSeen);
        });

        return () => {
            socket.off('new_message');
            socket.off('notification');
            socket.off('user_typing');
            socket.off('messages_read');
            socket.off('message_edited');
            socket.off('message_deleted');
            socket.off('message_reacted');
            socket.off('user_online');
            socket.off('user_offline');
        };
    }, [currentUserId]);

    // Update participant online status in conversations
    const updateConversationParticipantStatus = (userId, online, lastSeen) => {
        setConversations(prev => prev.map(conv => ({
            ...conv,
            participants: conv.participants?.map(p =>
                p._id === userId ? { ...p, online, lastSeen } : p
            )
        })));

        if (activeConversation) {
            setActiveConversation(prev => prev ? ({
                ...prev,
                participants: prev.participants?.map(p =>
                    p._id === userId ? { ...p, online, lastSeen } : p
                )
            }) : prev);
        }
    };

    // ─── Select conversation ──────────────────────────────
    const handleSelectConversation = async (conv) => {
        const socket = socketRef.current;

        // Leave previous room
        if (activeConversation) {
            socket?.emit('leave_conversation', activeConversation._id);
        }

        setActiveConversation(conv);
        setMessages([]);
        setTypingUsers({});

        // Join new room
        socket?.emit('join_conversation', conv._id);

        // Load messages
        const data = await getMessages(
            { conversationId: conv._id, limit: 50 },
            { t: jwt.token }
        );
        if (data && !data.error) {
            setMessages(data);
            setHasMore(data.length >= 50);
        }

        // Mark as read
        if (conv.unreadCount > 0) {
            await markAsRead({ conversationId: conv._id }, { t: jwt.token });
            socket?.emit('message_read', { conversationId: conv._id });

            setConversations(prev => prev.map(c =>
                c._id === conv._id ? { ...c, unreadCount: 0 } : c
            ));
        }
    };

    // ─── Load older messages ──────────────────────────────
    const handleLoadMore = async () => {
        if (!activeConversation || messages.length === 0) return;
        const oldest = messages[0];
        const data = await getMessages(
            { conversationId: activeConversation._id, limit: 50, before: oldest.createdAt },
            { t: jwt.token }
        );
        if (data && !data.error) {
            setMessages(prev => [...data, ...prev]);
            setHasMore(data.length >= 50);
        }
    };

    // ─── Send message ─────────────────────────────────────
    const handleSend = async ({ content, file }) => {
        if (!activeConversation) return;
        const socket = socketRef.current;

        if (file) {
            // Use REST API for file uploads
            const formData = new FormData();
            formData.append('conversation', activeConversation._id);
            formData.append('content', content || '');
            formData.append('media', file);
            formData.append('messageType', file.type.startsWith('image/') ? 'image' : 'file');

            const result = await sendMessageAPI({ t: jwt.token }, formData);
            if (result && !result.error) {
                // The new_message socket event will handle adding it to the UI
                // But also push it locally for immediate feedback
                setMessages(prev => {
                    if (prev.find(m => m._id === result._id)) return prev;
                    return [...prev, result];
                });
            }
        } else {
            // Use WebSocket for text-only messages (faster)
            socket?.emit('send_message', {
                conversationId: activeConversation._id,
                content,
                messageType: 'text'
            });
        }
    };

    // ─── Typing indicators ────────────────────────────────
    const handleTyping = () => {
        socketRef.current?.emit('typing', {
            conversationId: activeConversation?._id
        });
    };

    const handleStopTyping = () => {
        socketRef.current?.emit('stop_typing', {
            conversationId: activeConversation?._id
        });
    };

    // ─── Message actions ──────────────────────────────────
    const handleEdit = (messageId, content) => {
        socketRef.current?.emit('edit_message', {
            messageId,
            content,
            conversationId: activeConversation?._id
        });
    };

    const handleDelete = (messageId) => {
        if (!window.confirm('Delete this message?')) return;
        socketRef.current?.emit('delete_message', {
            messageId,
            conversationId: activeConversation?._id
        });
    };

    const handleReact = (messageId, emoji) => {
        socketRef.current?.emit('react_message', {
            messageId,
            emoji,
            conversationId: activeConversation?._id
        });
    };

    // ─── New conversation created ─────────────────────────
    const handleNewConversation = (conv) => {
        setConversations(prev => {
            if (prev.find(c => c._id === conv._id)) return prev;
            return [conv, ...prev];
        });
        handleSelectConversation(conv);
    };

    return (
        <div className="chat-page">
            <ConversationList
                conversations={conversations}
                activeConversation={activeConversation}
                onSelectConversation={handleSelectConversation}
                onNewChat={() => setShowNewChat(true)}
            />

            <div className="chat-main">
                {activeConversation ? (
                    <>
                        <ChatHeader 
                            conversation={activeConversation} 
                            onOpenSettings={() => setShowGroupSettings(true)}
                        />
                        <MessageArea
                            conversation={activeConversation}
                            messages={messages}
                            hasMore={hasMore}
                            onLoadMore={handleLoadMore}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onReact={handleReact}
                        />
                        <TypingIndicator
                            typingUsers={typingUsers}
                            currentUserId={currentUserId}
                        />
                        <MessageInput
                            onSend={handleSend}
                            onTyping={handleTyping}
                            onStopTyping={handleStopTyping}
                        />
                    </>
                ) : (
                    <div className="chat-empty-state">
                        <span style={{ fontSize: 64 }}>💬</span>
                        <h3>Welcome to Chat</h3>
                        <p>Select a conversation or start a new one</p>
                    </div>
                )}
            </div>

            {showNewChat && (
                <NewChatDialog
                    onClose={() => setShowNewChat(false)}
                    onConversationCreated={handleNewConversation}
                />
            )}
            {showGroupSettings && activeConversation && (
                <GroupChatDialog
                    conversation={activeConversation}
                    onClose={() => setShowGroupSettings(false)}
                    onUpdate={(updated) => {
                        setActiveConversation(updated);
                        setConversations(prev => prev.map(c => c._id === updated._id ? updated : c));
                    }}
                />
            )}
        </div>
    );
};

export default ChatPage;
