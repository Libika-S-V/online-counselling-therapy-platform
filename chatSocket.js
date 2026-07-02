const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Appointment = require('../models/Appointment');

const chatSocket = (io) => {
  // Middleware to authenticate socket handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token missing.'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_session_jwt_key_987654321');
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      return next(new Error('Authentication error: Token invalid.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected] ID: ${socket.id} | User: ${socket.user.id} (${socket.user.role})`);

    // User joins a session room
    socket.on('join_room', async ({ appointmentId }) => {
      try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
          socket.emit('error_message', { message: 'Appointment not found.' });
          return;
        }

        // Business Rule: Users can only join room if they are the client or therapist for that appointment
        if (socket.user.id !== String(appointment.clientId) && socket.user.id !== String(appointment.therapistId)) {
          socket.emit('error_message', { message: 'Access denied to this appointment room.' });
          return;
        }

        socket.join(appointmentId);
        console.log(`[Socket Join Room] User ${socket.user.id} entered: ${appointmentId}`);
      } catch (error) {
        console.error('Socket room join error:', error);
        socket.emit('error_message', { message: 'Server error entering session room.' });
      }
    });

    // User sends a message
    socket.on('send_message', async ({ appointmentId, content }) => {
      try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return;

        // Security check
        const isClient = socket.user.id === String(appointment.clientId);
        const isTherapist = socket.user.id === String(appointment.therapistId);
        if (!isClient && !isTherapist) return;

        const receiverId = isClient ? appointment.therapistId : appointment.clientId;

        const message = new Message({
          appointmentId,
          senderId: socket.user.id,
          receiverId,
          content
        });

        await message.save();

        const populatedMsg = await Message.findById(message._id)
          .populate('senderId', 'name profilePhoto')
          .populate('receiverId', 'name profilePhoto');

        // Broadcast to both users in the room
        io.to(appointmentId).emit('receive_message', populatedMsg);
      } catch (error) {
        console.error('Socket send_message error:', error);
      }
    });

    // User typing status indicator
    socket.on('typing', ({ appointmentId, isTyping }) => {
      socket.to(appointmentId).emit('typing', {
        userId: socket.user.id,
        role: socket.user.role,
        isTyping
      });
    });

    // Therapist ends session
    socket.on('session_end', async ({ appointmentId }) => {
      try {
        if (socket.user.role !== 'therapist') {
          socket.emit('error_message', { message: 'Only therapists can end a therapy session.' });
          return;
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment || String(appointment.therapistId) !== socket.user.id) return;

        appointment.status = 'completed';
        await appointment.save();

        io.to(appointmentId).emit('session_end', { appointmentId, status: 'completed' });
        console.log(`[Socket Session End] Appointment ${appointmentId} completed.`);
      } catch (error) {
        console.error('Socket session_end error:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] ID: ${socket.id}`);
    });
  });
};

module.exports = chatSocket;
