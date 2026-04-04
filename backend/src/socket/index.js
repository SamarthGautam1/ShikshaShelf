/**
 * Registers all Socket.io event handlers.
 * @param {import('socket.io').Server} io
 */
function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    /**
     * Teacher joins an attendance room so they receive real-time scan events.
     * Payload: { classId: string }
     */
    socket.on('attendance:join', ({ classId }) => {
      if (!classId) return;
      const room = `attendance:${classId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    /**
     * Leave an attendance room (e.g. when session ends).
     * Payload: { classId: string }
     */
    socket.on('attendance:leave', ({ classId }) => {
      if (!classId) return;
      const room = `attendance:${classId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = registerSocketHandlers;
