import React, { useEffect, useRef, useState } from 'react';
import auth from '../auth/auth-helper';
import { getMessages } from './api-chat';
import MessageBubble from './MessageBubble';

const MessageArea = ({ conversation, messages, onLoadMore, hasMore, onEdit, onDelete, onReact }) => {
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const jwt = auth.isAuthenticated();
    const currentUserId = jwt?.user?._id;

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (autoScroll) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, autoScroll]);

    // Track scroll position to determine if user scrolled up
    const handleScroll = () => {
        const el = containerRef.current;
        if (!el) return;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
        setAutoScroll(isNearBottom);
    };

    // Date divider logic
    const shouldShowDate = (msg, prevMsg) => {
        if (!prevMsg) return true;
        const d1 = new Date(msg.createdAt).toDateString();
        const d2 = new Date(prevMsg.createdAt).toDateString();
        return d1 !== d2;
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    };

    return (
        <div className="message-area" ref={containerRef} onScroll={handleScroll}>
            {/* Load more button */}
            {hasMore && (
                <button className="load-more-btn" onClick={onLoadMore}>
                    ↑ Load older messages
                </button>
            )}

            {messages.map((msg, index) => {
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const isOwn = (msg.sender?._id || msg.sender) === currentUserId;

                return (
                    <React.Fragment key={msg._id}>
                        {shouldShowDate(msg, prevMsg) && (
                            <div className="date-divider">
                                {formatDate(msg.createdAt)}
                            </div>
                        )}
                        <MessageBubble
                            message={msg}
                            isOwn={isOwn}
                            isGroup={conversation?.isGroup}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onReact={onReact}
                        />
                    </React.Fragment>
                );
            })}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageArea;
