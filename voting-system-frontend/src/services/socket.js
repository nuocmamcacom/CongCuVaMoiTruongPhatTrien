import io from 'socket.io-client';

const socketService = {
  socket: null,

  connect() {
    if (!this.socket) {
      this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        withCredentials: true,
      });
      this.socket.on('connect', () => {
        console.log('Connected to socket server');
      });
    }
  },

  joinPoll(pollId) {
    if (this.socket && pollId) {
      this.socket.emit('join-poll', pollId);
    }
  },

  leavePoll(pollId) {
    if (this.socket && pollId) {
      this.socket.emit('leave-poll', pollId);
    }
  },

  onPollUpdate(callback) {
    if (this.socket) {
      this.socket.on('poll-update', callback);
    }
  },

  onNewPoll(callback) {
    if (this.socket) {
      this.socket.on('new-poll', callback);
    }
  },

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  },

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },
};

export default socketService;