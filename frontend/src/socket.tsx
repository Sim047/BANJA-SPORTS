import React, { createContext, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { getTokenFromStorage } from './utils/auth'; // your helper

export const socket = io(process.env.REACT_APP_API_URL || '/', {
  autoConnect: false,
  // If you want to use auth token with socket handshake:
  // auth: { token: getTokenFromStorage() }
});

// React context
export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // connect after verifying token or user loaded
    socket.connect();

    // identify to join personal room:
    const currentUserId = localStorage.getItem('userId'); // or from your user store
    if (currentUserId) {
      socket.emit('identify', currentUserId);
    }

    // cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
