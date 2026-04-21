import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

/**
 * Custom hook that manages a Socket.io connection for live attendance tracking.
 * Connects to the backend, joins an attendance room for the given class,
 * and accumulates real-time attendance events (present via `attendance:marked`
 * and absent via `attendance:session-closed`).
 * @param {string|null} classId - The class ID to track. Only connects when truthy.
 * @param {string} [token] - Optional JWT token for authenticating the socket connection.
 * @returns {{
 *   attendees: Array<{studentName: string, markedAt: string, student_id: string, class_id: string}>,
 *   absentees: Array<{student_id: string, name: string}>,
 *   isConnected: boolean,
 *   setAttendees: Function,
 *   setAbsentees: Function,
 * }}
 */
export default function useAttendanceSocket(classId, token) {
  const [attendees, setAttendees] = useState([]);
  const [absentees, setAbsentees] = useState([]);
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
      const { studentName, markedAt, student_id, class_id } = data || {};
      setAttendees((prev) => [...prev, { studentName, markedAt, student_id, class_id }]);
    });

    // Payload: { class_id, absent_students: [{ student_id, name }] }
    socket.on('attendance:session-closed', (data) => {
      const absentList = Array.isArray(data?.absent_students) ? data.absent_students : [];
      setAbsentees((prev) => {
        const byId = new Map(prev.map((a) => [a.student_id, a]));
        for (const entry of absentList) {
          if (entry && entry.student_id) {
            byId.set(entry.student_id, entry);
          }
        }
        return Array.from(byId.values());
      });
    });

    return () => {
      socket.emit('attendance:leave', { classId });
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setAttendees([]);
      setAbsentees([]);
    };
  }, [classId, token]);

  return { attendees, absentees, isConnected, setAttendees, setAbsentees };
}
