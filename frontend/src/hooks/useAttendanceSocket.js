import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

/**
 * Custom hook that manages a Socket.io connection for live attendance tracking.
 * Connects to the backend, joins an attendance room for the given class,
 * and accumulates real-time attendance events.
 * @param {string|null} classId - The class ID to track. Only connects when truthy.
 * @param {string} [token] - Optional JWT token for authenticating the socket connection.
 * @returns {{ attendees: Array<{studentName: string, markedAt: string}>, isConnected: boolean }}
 */
export default function useAttendanceSocket(classId, token) {
  const [attendees, setAttendees] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!classId) {
      return;
    }

    const socketOptions = {
      transports: ['websocket', 'polling'],
    };
    if (token) {
      socketOptions.auth = { token };
    }

    const socket = io(SOCKET_URL, socketOptions);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('attendance:join', { classId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('attendance:marked', (data) => {
      setAttendees((prev) => [...prev, data]);
    });

    return () => {
      socket.emit('attendance:leave', { classId });
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setAttendees([]);
    };
  }, [classId, token]);

  return { attendees, isConnected };
}
