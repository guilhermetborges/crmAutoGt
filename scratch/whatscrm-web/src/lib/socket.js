'use client';
import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
    if (socket) return socket;

    socket = io('/', {
        auth: { token },
        path: '/api/v1/socket.io', // Adjust based on NestJS config
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
