import React from 'react';

const TypingIndicator = ({ typingUsers, currentUserId }) => {
    const activeTypers = Object.entries(typingUsers || {}).filter(
        ([uid, info]) => uid !== currentUserId && info.isTyping
    );

    if (activeTypers.length === 0) return <div className="typing-indicator"></div>;

    const names = activeTypers.map(([, info]) => info.name || 'Someone');
    const text = names.length === 1
        ? `${names[0]} is typing`
        : `${names.join(', ')} are typing`;

    return (
        <div className="typing-indicator">
            <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span>{text}</span>
        </div>
    );
};

export default TypingIndicator;
