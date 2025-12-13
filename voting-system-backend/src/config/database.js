const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);


        mongoose.connection.on('error', (err) => {
        });

        mongoose.connection.on('disconnected', () => {
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });

    } catch (error) {
        process.exit(1);
    }
};

module.exports = connectDB;