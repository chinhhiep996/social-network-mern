import React, { useState, useEffect } from 'react';
import auth from '../auth/auth-helper';
import { listConversations } from './api-chat';
import ConversationItem from './ConversationItem';

const ConversationList = ({ activeConversation, onSelectConversation, conversations, onNewChat }) => {
    const [search, setSearch] = useState('');
    const jwt = auth.isAuthenticated();
    const currentUserId = jwt?.user?._id;

    const filtered = conversations.filter(conv => {
        if (!search) return true;
        const s = search.toLowerCase();
        if (conv.isGroup) return conv.groupName?.toLowerCase().includes(s);
        const other = conv.participants?.find(p => p._id !== currentUserId);
        return other?.name?.toLowerCase().includes(s);
    });

    return (
        <div className="chat-sidebar">
            <div className="sidebar-header">
                <h2>Chats</h2>
                <button className="new-chat-btn" onClick={onNewChat} title="New Chat">
                    ✏️
                </button>
            </div>

            <div className="sidebar-search">
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="conversation-list">
                {filtered.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                        {search ? 'No matching conversations' : 'No conversations yet'}
                    </div>
                )}
                {filtered.map(conv => (
                    <ConversationItem
                        key={conv._id}
                        conversation={conv}
                        currentUserId={currentUserId}
                        isActive={activeConversation?._id === conv._id}
                        onClick={() => onSelectConversation(conv)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ConversationList;
