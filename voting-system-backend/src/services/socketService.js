let io;

const initializeSocket = (socketIO) => {
    io = socketIO;
    
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join poll room
        socket.on('join-poll', (pollId) => {
            socket.join(`poll-${pollId}`);
            console.log(`User ${socket.id} joined poll room: poll-${pollId}`);
        });

        // Leave poll room
        socket.on('leave-poll', (pollId) => {
            socket.leave(`poll-${pollId}`);
            console.log(`User ${socket.id} left poll room: poll-${pollId}`);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

const broadcastPollUpdate = (pollId, results) => {
    if (io) {
        io.to(`poll-${pollId}`).emit('poll-update', {
            poll_id: pollId,
            results: results,
            timestamp: new Date().toISOString()
        });
    }
};

const broadcastNewPoll = (poll) => {
    if (io) {
        io.emit('new-poll', poll);
    }
};

module.exports = {
    initializeSocket,
    broadcastPollUpdate,
    broadcastNewPoll
};