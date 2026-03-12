const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "ca.pem")),
  },
  waitForConnections: true,
  connectionLimit: 10,
});

const db = pool.promise();

// Verify connection on startup
db.query("SELECT 1")
  .then(() => console.log("✅ Connected to Aiven MySQL database"))
  .catch((err) => {
    console.error("❌ Failed to connect to Aiven database:", err.message);
    process.exit(1);
  });

module.exports = db;
