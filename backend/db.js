const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

const localDb = require("./localDb");

// Create MySQL connection pool
const cloudConnection = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  ssl: {
    ca: fs.readFileSync("./ca.pem") // Aiven CA cert
  }
});

const cloudDb = cloudConnection.promise();
let isCloudConnected = true;

/**
 * Database wrapper with automatic failover [for development only]
 * Tries cloud database first, falls back to local SQLite if connection fails
 */
const dbProxy = {
  async query(sql, params = []) {
    if (isCloudConnected) {
      try {
        const result = await cloudDb.query(sql, params);
        return result;
      } catch (err) {
        console.error("❌ Cloud database error:", err.message);
        console.warn("⚠️  Switching to local database fallback...");
        isCloudConnected = false;
        
        // Fallback to local database
        try {
          return await localDb.query(sql, params);
        } catch (localErr) {
          console.error("❌ Local database error:", localErr.message);
          throw localErr;
        }
      }
    } else {
      // Already failed, use local database
      try {
        return await localDb.query(sql, params);
      } catch (err) {
        console.error("❌ Local database error:", err.message);
        throw err;
      }
    }
  }
};

module.exports = dbProxy;