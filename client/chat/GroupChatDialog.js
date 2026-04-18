import React, { useState, useEffect } from 'react';
import auth from '../auth/auth-helper';
import { list as listUsers } from '../user/api-user';
import { updateGroup, updateParticipants } from './api-chat';

const GroupChatDialog = ({ conversation, onClose, onUpdate }) => {
    const [groupName, setGroupName] = useState(conversation.groupName || '');
    const [allUsers, setAllUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    
    const jwt = auth.isAuthenticated();
    const currentUserId = jwt?.user?._id;
    const isAdmin = conversation.admin === currentUserId || conversation.admin?._id === currentUserId;

    useEffect(() => {
        listUsers().then(data => {
            if (data && !data.error) {
                // Filter out users already in the group
                const participantIds = conversation.participants.map(p => p._id);
                setAllUsers(data.filter(u => u._id !== currentUserId && !participantIds.includes(u._id)));
            }
        });
    }, [conversation.participants, currentUserId]);

    const handleUpdateName = async () => {
        if (!groupName.trim() || groupName === conversation.groupName) return;
        setLoading(true);
        const data = await updateGroup({ conversationId: conversation._id }, { t: jwt.token }, { groupName });
        if (data && !data.error) {
            onUpdate(data);
        }
        setLoading(false);
    };

    const handleAddParticipant = async (userId) => {
        setLoading(true);
        const data = await updateParticipants(
            { conversationId: conversation._id }, 
            { t: jwt.token }, 
            { action: 'add', participantId: userId }
        );
        if (data && !data.error) {
            onUpdate(data);
        }
        setLoading(false);
    };

    const handleRemoveParticipant = async (userId) => {
        if (!window.confirm('Remove this member?')) return;
        setLoading(true);
        const data = await updateParticipants(
            { conversationId: conversation._id }, 
            { t: jwt.token }, 
            { action: 'remove', participantId: userId }
        );
        if (data && !data.error) {
            onUpdate(data);
        }
        setLoading(false);
    };

    const filteredUsers = allUsers.filter(u => 
        u.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-content" onClick={e => e.stopPropagation()}>
                <div className="dialog-header">
                    <h3>Group Settings</h3>
                    <button className="dialog-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="dialog-body">
                    <label style={{color: '#94a3b8', fontSize: '12px', marginBottom: '4px', display: 'block'}}>Group Name</label>
                    <div style={{display: 'flex', gap: '8px', marginBottom: '20px'}}>
                        <input
                            type="text"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            disabled={!isAdmin}
                        />
                        {isAdmin && (
                            <button className="dialog-btn primary" onClick={handleUpdateName} disabled={loading}>
                                Update
                            </button>
                        )}
                    </div>

                    <label style={{color: '#94a3b8', fontSize: '12px', marginBottom: '8px', display: 'block'}}>Members ({conversation.participants.length})</label>
                    <div style={{maxHeight: '150px', overflowY: 'auto', marginBottom: '20px'}}>
                        {conversation.participants.map(p => (
                            <div key={p._id} className="user-select-item">
                                <div className="avatar-placeholder" style={{width: 32, height: 32, fontSize: 12}}>
                                    {p.name?.[0].toUpperCase()}
                                </div>
                                <span className="user-name">{p.name} {p._id === currentUserId ? '(You)' : ''}</span>
                                {isAdmin && p._id !== currentUserId && (
                                    <button 
                                        onClick={() => handleRemoveParticipant(p._id)}
                                        style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'}}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {isAdmin && (
                        <>
                            <label style={{color: '#94a3b8', fontSize: '12px', marginBottom: '4px', display: 'block'}}>Add Members</label>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <div style={{maxHeight: '150px', overflowY: 'auto'}}>
                                {filteredUsers.map(user => (
                                    <div key={user._id} className="user-select-item" onClick={() => handleAddParticipant(user._id)}>
                                        <div className="avatar-placeholder" style={{width: 32, height: 32, fontSize: 12}}>
                                            {user.name?.[0].toUpperCase()}
                                        </div>
                                        <span className="user-name">{user.name}</span>
                                        <span style={{color: '#818cf8', fontSize: '12px'}}>Add +</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupChatDialog;
