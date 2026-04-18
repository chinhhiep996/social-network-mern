import React from 'react';

const EMOJI_LIST = [
    '😀','😂','😍','🥰','😎','🤔','😢','😡','👍','👎',
    '❤️','🔥','🎉','👏','💯','🙏','😊','🤣','😘','🥺',
    '😭','😤','🤗','😱','🤩','😴','💀','🤡','👀','💬',
    '✨','🌟','🎵','💪','🤝','🙌','🫶','💕','💝','💖'
];

const EmojiPicker = ({ onSelect, onClose }) => {
    return (
        <div className="emoji-picker-container" onClick={(e) => e.stopPropagation()}>
            <div className="emoji-grid">
                {EMOJI_LIST.map((emoji, i) => (
                    <button
                        key={i}
                        className="emoji-btn"
                        onClick={() => { onSelect(emoji); onClose(); }}
                        title={emoji}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const REACTION_EMOJIS = ['👍','❤️','😂','😮','😢','😡'];

export default EmojiPicker;
