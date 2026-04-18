import { io } from 'socket.io-client';
import auth from '../auth/auth-helper';

let socket = null;

/**
 * Get or create the Socket.IO client singleton.
 * Automatically authenticates using the JWT from session storage.
 */
const getSocket = () => {
    if (socket && socket.connected) {
        return socket;
    }

    const jwt = auth.isAuthenticated();
    if (!jwt) return null;

    socket = io({
        auth: {
            token: jwt.token
        },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000
    });

    socket.on('connect', () => {
        console.log('Socket.IO connected');
    });

    socket.on('connect_error', (err) => {
        console.error('Socket.IO connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
    });

    return socket;
};

/**
 * Disconnect the socket (call on signout)
 */
const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export { getSocket, disconnectSocket };
