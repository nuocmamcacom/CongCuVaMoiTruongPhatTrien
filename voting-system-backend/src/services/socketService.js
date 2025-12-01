let io;

const initializeSocket = (socketIO) => {
    io = socketIO;
    
    io.on('connection', (socket) => {

        // Join poll room
        socket.on('joinPoll', (pollId) => {
            socket.join(`poll-${pollId}`);
        });

        // Leave poll room
        socket.on('leavePoll', (pollId) => {
            socket.leave(`poll-${pollId}`);
        });

        socket.on('disconnect', () => {
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