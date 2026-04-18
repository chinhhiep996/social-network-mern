import React from 'react';

const ConversationItem = ({ conversation, currentUserId, isActive, onClick }) => {
    const isGroup = conversation.isGroup;

    // For 1:1 chats, get the other participant
    const otherUser = !isGroup
        ? conversation.participants?.find(p => p._id !== currentUserId)
        : null;

    const displayName = isGroup
        ? conversation.groupName
        : (otherUser?.name || 'Unknown User');

    const initials = displayName
        ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const isOnline = otherUser?.online;

    // Format last message preview
    let preview = '';
    if (conversation.lastMessage) {
        const msg = conversation.lastMessage;
        const senderName = msg.sender?._id === currentUserId ? 'You' : (msg.sender?.name || '');
        if (msg.isDeleted) {
            preview = '🚫 Message deleted';
        } else if (msg.messageType === 'image') {
            preview = `${senderName}: 📷 Photo`;
        } else if (msg.messageType === 'file') {
            preview = `${senderName}: 📎 File`;
        } else {
            preview = isGroup ? `${senderName}: ${msg.content || ''}` : (msg.content || '');
        }
    }

    // Format time
    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return d.toLocaleDateString([], { weekday: 'short' });
        }
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const timeStr = conversation.lastMessage
        ? formatTime(conversation.lastMessage.createdAt || conversation.updatedAt)
        : formatTime(conversation.createdAt);

    return (
        <div
            className={`conversation-item ${isActive ? 'active' : ''}`}
            onClick={onClick}
        >
            <div className="avatar-wrapper">
                {otherUser?.photo?.data ? (
                    <img
                        className="avatar"
                        src={`/api/users/photo/${otherUser._id}`}
                        alt={displayName}
                    />
                ) : (
                    <div className="avatar-placeholder">{initials}</div>
                )}
                {!isGroup && isOnline && <div className="online-dot"></div>}
            </div>

            <div className="conversation-info">
                <p className="conv-name">
                    {isGroup ? '👥 ' : ''}{displayName}
                </p>
                <p className="conv-preview">{preview}</p>
            </div>

            <div className="conversation-meta">
                <span className="conv-time">{timeStr}</span>
                {conversation.unreadCount > 0 && (
                    <span className="unread-badge">{conversation.unreadCount}</span>
                )}
            </div>
        </div>
    );
};

export default ConversationItem;
