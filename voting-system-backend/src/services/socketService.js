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

        // Join form room
        socket.on('joinForm', (formId) => {
            socket.join(`form-${formId}`);
        });

        // Leave form room
        socket.on('leaveForm', (formId) => {
            socket.leave(`form-${formId}`);
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

const broadcastFormUpdate = (formId, submissionCount) => {
    if (io) {
        io.to(`form-${formId}`).emit('form-update', {
            form_id: formId,
            submission_count: submissionCount,
            timestamp: new Date().toISOString()
        });
    }
};

const broadcastNewForm = (form) => {
    if (io) {
        io.emit('new-form', form);
    }
};

module.exports = {
    initializeSocket,
    broadcastPollUpdate,
    broadcastNewPoll,
    broadcastFormUpdate,
    broadcastNewForm
};