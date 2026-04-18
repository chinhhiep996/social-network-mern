import React from 'react';
import auth from '../auth/auth-helper';

const ChatHeader = ({ conversation, onOpenSettings }) => {
    const jwt = auth.isAuthenticated();
    const currentUserId = jwt?.user?._id;

    if (!conversation) return null;

    const isGroup = conversation.isGroup;
    const otherUser = !isGroup
        ? conversation.participants?.find(p => p._id !== currentUserId)
        : null;

    const displayName = isGroup ? conversation.groupName : (otherUser?.name || 'Unknown');
    const initials = displayName
        ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const isOnline = otherUser?.online;
    const statusText = isGroup
        ? `${conversation.participants?.length || 0} members`
        : (isOnline ? 'Online' : (otherUser?.lastSeen
            ? `Last seen ${new Date(otherUser.lastSeen).toLocaleString()}`
            : 'Offline'));

    return (
        <div className="chat-header">
            <button className="mobile-back-btn">←</button>
            {otherUser?.photo?.data ? (
                <img
                    className="avatar"
                    src={`/api/users/photo/${otherUser._id}`}
                    alt={displayName}
                    style={{ width: 40, height: 40, borderRadius: '50%' }}
                />
            ) : (
                <div className="avatar-placeholder" style={{ width: 40, height: 40, fontSize: 16 }}>
                    {initials}
                </div>
            )}
            <div className="chat-header-info">
                <h3>{isGroup ? '👥 ' : ''}{displayName}</h3>
                <p className={`status-text ${isOnline ? 'online' : ''}`}>{statusText}</p>
            </div>
            {isGroup && (
                <button 
                    onClick={onOpenSettings} 
                    style={{marginLeft: 'auto', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px'}}
                    title="Group Settings"
                >
                    ⚙️
                </button>
            )}
        </div>
    );
};

export default ChatHeader;
