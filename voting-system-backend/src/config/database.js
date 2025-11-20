const sql = require('mssql');

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'true',
        enableArithAbort: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
    requestTimeout: 30000,
    connectionTimeout: 15000, // Có thể tăng lên 30000 nếu cần
    port: 1433, // Thêm cổng mặc định
};

let pool = null;

const getPool = async () => {
    if (!pool || !pool.connected) {
        console.log('Creating or reconnecting database pool to:', config.server);
        try {
            if (pool) {
                await pool.close();
                console.log('Closed previous pool connection.');
            }
            pool = await sql.connect(config);
            console.log('Connected to MSSQL Database');
        } catch (err) {
            console.error('Database connection failed:', err);
            pool = null;
            throw err;
        }
    } else {
        console.log('Reusing existing database connection pool...');
    }
    return pool;
};

module.exports = {
    sql,
    getPool
};