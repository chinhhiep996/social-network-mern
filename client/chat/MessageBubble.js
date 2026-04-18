import React, { useState } from 'react';
import auth from '../auth/auth-helper';
import { REACTION_EMOJIS } from './EmojiPicker';

const MessageBubble = ({ message, isOwn, isGroup, onEdit, onDelete, onReact }) => {
    const [showReactions, setShowReactions] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editText, setEditText] = useState(message.content || '');
    const jwt = auth.isAuthenticated();
    const currentUserId = jwt?.user?._id;

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleEdit = () => {
        if (editText.trim() && editText !== message.content) {
            onEdit(message._id, editText.trim());
        }
        setEditing(false);
    };

    // Group reactions by emoji
    const groupedReactions = {};
    (message.reactions || []).forEach(r => {
        if (!groupedReactions[r.emoji]) {
            groupedReactions[r.emoji] = { emoji: r.emoji, users: [], hasOwn: false };
        }
        groupedReactions[r.emoji].users.push(r.user);
        if (r.user?._id === currentUserId || r.user === currentUserId) {
            groupedReactions[r.emoji].hasOwn = true;
        }
    });

    // Read receipt for own messages
    const readByOthers = (message.readBy || []).filter(r =>
        (r.user?._id || r.user) !== currentUserId
    );

    if (message.isDeleted) {
        return (
            <div className={`message-row ${isOwn ? 'own' : 'other'}`}>
                <div className="message-bubble deleted">
                    <p className="message-content">🚫 This message was deleted</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`message-row ${isOwn ? 'own' : 'other'}`}>
            <div className="message-bubble" onMouseLeave={() => setShowReactions(false)}>
                {/* Action buttons (visible on hover via CSS) */}
                <div className="message-actions">
                    <button className="msg-action-btn" onClick={() => setShowReactions(!showReactions)} title="React">
                        😀
                    </button>
                    {isOwn && (
                        <>
                            <button className="msg-action-btn" onClick={() => { setEditing(true); setEditText(message.content || ''); }} title="Edit">
                                ✏️
                            </button>
                            <button className="msg-action-btn" onClick={() => onDelete(message._id)} title="Delete">
                                🗑️
                            </button>
                        </>
                    )}
                </div>

                {/* Reaction picker popup */}
                {showReactions && (
                    <div className="reaction-picker" style={{ position: 'absolute', top: -40, [isOwn ? 'right' : 'left']: 0, zIndex: 20 }}>
                        {REACTION_EMOJIS.map(emoji => (
                            <button key={emoji} onClick={() => { onReact(message._id, emoji); setShowReactions(false); }}>
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                {/* Sender name in group chats */}
                {isGroup && !isOwn && (
                    <div className="message-sender">{message.sender?.name}</div>
                )}

                {/* Media content */}
                {message.messageType === 'image' && message.media && (
                    <div className="message-media">
                        <img
                            src={`/api/chat/messages/${message._id}/media`}
                            alt="Shared image"
                            onClick={() => window.open(`/api/chat/messages/${message._id}/media`, '_blank')}
                        />
                    </div>
                )}
                {message.messageType === 'file' && message.media && (
                    <a className="message-file" href={`/api/chat/messages/${message._id}/media`} download>
                        📎 <span>{message.media.fileName || 'File'}</span>
                    </a>
                )}

                {/* Text content or edit mode */}
                {editing ? (
                    <div className="edit-input-wrapper">
                        <input
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') setEditing(false); }}
                            autoFocus
                        />
                        <button onClick={handleEdit} style={{ background: '#6366f1', color: 'white' }}>✓</button>
                        <button onClick={() => setEditing(false)} style={{ background: '#333', color: '#ccc' }}>✕</button>
                    </div>
                ) : (
                    message.content && <p className="message-content">{message.content}</p>
                )}

                {/* Meta: time, edited, read status */}
                <div className="message-meta">
                    {message.isEdited && <span className="message-edited">edited</span>}
                    <span className="message-time">{formatTime(message.createdAt)}</span>
                    {isOwn && (
                        <span className="message-read-status">
                            {readByOthers.length > 0 ? '✓✓' : '✓'}
                        </span>
                    )}
                </div>

                {/* Reactions display */}
                {Object.keys(groupedReactions).length > 0 && (
                    <div className="message-reactions">
                        {Object.values(groupedReactions).map(r => (
                            <span
                                key={r.emoji}
                                className={`reaction-chip ${r.hasOwn ? 'own' : ''}`}
                                onClick={() => onReact(message._id, r.emoji)}
                            >
                                {r.emoji}
                                <span className="reaction-count">{r.users.length}</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
