import React, { useState, useRef } from 'react';
import EmojiPicker from './EmojiPicker';

const MessageInput = ({ onSend, onTyping, onStopTyping }) => {
    const [text, setText] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const handleTextChange = (e) => {
        setText(e.target.value);
        onTyping?.();

        // Auto-stop typing after 2 seconds of no input
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            onStopTyping?.();
        }, 2000);
    };

    const handleFileSelect = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        setFile(selected);

        if (selected.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (ev) => setFilePreview(ev.target.result);
            reader.readAsDataURL(selected);
        } else {
            setFilePreview(null);
        }
    };

    const removeFile = () => {
        setFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const handleSend = () => {
        const trimmed = text.trim();
        if (!trimmed && !file) return;

        onSend({ content: trimmed, file });
        setText('');
        removeFile();
        setShowEmoji(false);
        onStopTyping?.();

        // Re-focus textarea
        setTimeout(() => textareaRef.current?.focus(), 50);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const insertEmoji = (emoji) => {
        setText(prev => prev + emoji);
        textareaRef.current?.focus();
    };

    // Auto-resize textarea
    const handleInput = (e) => {
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    return (
        <div className="message-input-area">
            {/* File preview */}
            {file && (
                <div className="file-preview">
                    {filePreview ? (
                        <img src={filePreview} alt="Preview" />
                    ) : (
                        <div className="avatar-placeholder" style={{ width: 48, height: 48, fontSize: 20 }}>📎</div>
                    )}
                    <div className="file-info">
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{formatFileSize(file.size)}</div>
                    </div>
                    <button className="remove-file-btn" onClick={removeFile}>✕</button>
                </div>
            )}

            {/* Emoji picker */}
            {showEmoji && (
                <EmojiPicker
                    onSelect={insertEmoji}
                    onClose={() => setShowEmoji(false)}
                />
            )}

            <div className="message-input-wrapper">
                <div className="input-actions">
                    <button
                        className="input-action-btn"
                        onClick={() => setShowEmoji(!showEmoji)}
                        title="Emoji"
                    >
                        😊
                    </button>
                    <button
                        className="input-action-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach file"
                    >
                        📎
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                    />
                </div>

                <textarea
                    ref={textareaRef}
                    placeholder="Type a message..."
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    onInput={handleInput}
                    rows={1}
                />

                <button
                    className="send-btn"
                    onClick={handleSend}
                    disabled={!text.trim() && !file}
                    title="Send"
                >
                    ➤
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
