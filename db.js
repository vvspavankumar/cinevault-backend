const mysql = require("mysql2");

let db;

if (process.env.DATABASE_URL) {
    // Production (Render)
    db = mysql.createConnection(process.env.DATABASE_URL);
} else {
    // Local
    db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT,
    });
}

db.connect((err) => {
    if (err) {
        console.error("❌ DB connection failed:", err);
    } else {
        console.log("✅ Connected to Railway MySQL");
    }
});

module.exports = db;