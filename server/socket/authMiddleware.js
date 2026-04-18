import jwt from 'jsonwebtoken';
import config from '../../config/config';

/**
 * Socket.IO authentication middleware
 * Verifies JWT token from handshake auth or query params
 */
const socketAuthMiddleware = (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        
        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        socket.userId = decoded._id;
        next();
    } catch (err) {
        next(new Error('Invalid token'));
    }
};

export default socketAuthMiddleware;
