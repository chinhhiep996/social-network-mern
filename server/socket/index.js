import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'ioredis';

import config from '../../config/config';
import socketAuthMiddleware from './authMiddleware';
import registerChatHandlers from './chatHandlers';
import User from '../models/user.model';

/**
 * Initialize Socket.IO server with Redis adapter for horizontal scaling
 */
const initializeSocket = async (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Setup Redis adapter for scaling (optional — gracefully falls back)
    try {
        if (config.redisUrl) {
            const pubClient = new createClient(config.redisUrl);
            const subClient = pubClient.duplicate();

            await Promise.all([
                new Promise((resolve, reject) => {
                    pubClient.on('ready', resolve);
                    pubClient.on('error', reject);
                }),
                new Promise((resolve, reject) => {
                    subClient.on('ready', resolve);
                    subClient.on('error', reject);
                })
            ]);

            io.adapter(createAdapter(pubClient, subClient));
            console.log('Socket.IO Redis adapter connected');
        } else {
            console.log('Socket.IO running without Redis adapter (single-node mode)');
        }
    } catch (err) {
        console.warn('Redis adapter failed, running in single-node mode:', err.message);
    }

    // Apply authentication middleware
    io.use(socketAuthMiddleware);

    // Handle connections
    io.on('connection', async (socket) => {
        const userId = socket.userId;
        console.log(`User connected: ${userId}`);

        // Join user's personal room for notifications
        socket.join(`user:${userId}`);

        // Update online status
        try {
            await User.findByIdAndUpdate(userId, {
                online: true,
                lastSeen: new Date()
            });

            // Broadcast online status to all connected users
            socket.broadcast.emit('user_online', {
                userId,
                online: true,
                lastSeen: new Date()
            });
        } catch (err) {
            console.error('Error updating online status:', err);
        }

        // Register chat event handlers
        registerChatHandlers(io, socket);

        // Handle disconnection
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${userId}`);

            try {
                // Check if user has any other active connections
                const userRoom = io.sockets.adapter.rooms.get(`user:${userId}`);
                if (!userRoom || userRoom.size === 0) {
                    await User.findByIdAndUpdate(userId, {
                        online: false,
                        lastSeen: new Date()
                    });

                    socket.broadcast.emit('user_offline', {
                        userId,
                        online: false,
                        lastSeen: new Date()
                    });
                }
            } catch (err) {
                console.error('Error updating offline status:', err);
            }
        });
    });

    return io;
};

export default initializeSocket;
