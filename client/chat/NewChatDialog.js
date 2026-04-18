import React, { useState, useEffect } from 'react';
import auth from '../auth/auth-helper';
import { list as listUsers } from '../user/api-user';
import { createConversation } from './api-chat';

const NewChatDialog = ({ onClose, onConversationCreated }) => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [mode, setMode] = useState('direct'); // 'direct' | 'group'
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(false);

    const jwt = auth.isAuthenticated();
    const currentUserId = jwt?.user?._id;

    useEffect(() => {
        // Fetch all users
        listUsers().then(data => {
            if (data && !data.error) {
                setUsers(data.filter(u => u._id !== currentUserId));
            }
        });
    }, []);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const toggleUser = (userId) => {
        if (mode === 'direct') {
            setSelectedUsers([userId]);
        } else {
            setSelectedUsers(prev =>
                prev.includes(userId)
                    ? prev.filter(id => id !== userId)
                    : [...prev, userId]
            );
        }
    };

    const handleCreate = async () => {
        if (selectedUsers.length === 0) return;
        setLoading(true);

        try {
            const data = await createConversation(
                { t: jwt.token },
                {
                    participants: [...selectedUsers, currentUserId],
                    isGroup: mode === 'group',
                    groupName: mode === 'group' ? groupName : undefined
                }
            );

            if (data && !data.error) {
                onConversationCreated(data);
                onClose();
            }
        } catch (err) {
            console.error('Error creating conversation:', err);
        }

        setLoading(false);
    };

    const canCreate = mode === 'direct'
        ? selectedUsers.length === 1
        : selectedUsers.length >= 2 && groupName.trim();

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-content" onClick={e => e.stopPropagation()}>
                <div className="dialog-header">
                    <h3>New Conversation</h3>
                    <button className="dialog-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="dialog-body">
                    {/* Mode tabs */}
                    <div className="dialog-tabs">
                        <button
                            className={`dialog-tab ${mode === 'direct' ? 'active' : ''}`}
                            onClick={() => { setMode('direct'); setSelectedUsers([]); }}
                        >
                            💬 Direct
                        </button>
                        <button
                            className={`dialog-tab ${mode === 'group' ? 'active' : ''}`}
                            onClick={() => { setMode('group'); setSelectedUsers([]); }}
                        >
                            👥 Group
                        </button>
                    </div>

                    {/* Group name input */}
                    {mode === 'group' && (
                        <input
                            type="text"
                            placeholder="Group name..."
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                        />
                    )}

                    {/* Search users */}
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    {/* Selected chips for group */}
                    {mode === 'group' && selectedUsers.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                            {selectedUsers.map(uid => {
                                const u = users.find(usr => usr._id === uid);
                                return (
                                    <span key={uid} className="reaction-chip own" onClick={() => toggleUser(uid)}>
                                        {u?.name || uid} ✕
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* User list */}
                    {filteredUsers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 14 }}>
                            No users found
                        </div>
                    ) : (
                        filteredUsers.map(user => (
                            <div
                                key={user._id}
                                className={`user-select-item ${selectedUsers.includes(user._id) ? 'selected' : ''}`}
                                onClick={() => toggleUser(user._id)}
                            >
                                <div className="avatar-placeholder" style={{ width: 36, height: 36, fontSize: 14 }}>
                                    {user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                                <span className="user-name">{user.name}</span>
                                {selectedUsers.includes(user._id) && (
                                    <span className="check-mark">✓</span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="dialog-footer">
                    <button className="dialog-btn secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="dialog-btn primary"
                        onClick={handleCreate}
                        disabled={!canCreate || loading}
                    >
                        {loading ? 'Creating...' : (mode === 'group' ? 'Create Group' : 'Start Chat')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewChatDialog;
