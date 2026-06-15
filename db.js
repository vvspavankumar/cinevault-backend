const mysql = require("mysql2");

const db = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ DB connection failed:", err);
    } else {
        console.log("✅ Connected to Railway MySQL");
        connection.release();
    }
});

module.exports = db;