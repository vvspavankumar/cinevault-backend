const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

db.connect((err) => {
    if (err) {
        console.error("❌ DB connection failed:", err);
    } else {
        console.log("✅ Connected to Railway MySQL");
    }
});
db.connect((err) => {
    if (err) {
        console.error("❌ DB connection failed:", err);
    } else {
        console.log("✅ Connected to Railway MySQL");

        db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `, (err) => {
            if (err) console.log("Table creation error:", err);
            else console.log("✅ Users table ready");
        });
    }
});
module.exports = db;
