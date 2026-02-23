const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create/connect to local SQLite database
const dbPath = path.join(__dirname, "local.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening local database:", err.message);
    } else {
        console.log("Connected to local SQLite database at:", dbPath);
        initializeLocalDatabase();
    }
});

/**
 * Initialize local database with tables if they don't exist
 */
function initializeLocalDatabase() {
    db.serialize(() => {
        // Create user_data table
        db.run(`
            CREATE TABLE IF NOT EXISTS user_data (
                email TEXT PRIMARY KEY,
                lecturer INTEGER NOT NULL DEFAULT 0 CHECK (lecturer IN (0,1)),
                points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
                passkey TEXT NOT NULL
            )
        `);

        // Create notes table
        db.run(`
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_email TEXT NOT NULL,
                is_verified INTEGER NOT NULL DEFAULT 0 CHECK (is_verified IN (0,1)),
                note_data TEXT NOT NULL,
                module TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (owner_email) REFERENCES user_data(email) ON DELETE CASCADE
            )
        `);

        // Create suggestions table
        db.run(`
            CREATE TABLE IF NOT EXISTS suggestions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_id INTEGER NOT NULL,
                commenter_email TEXT NOT NULL,
                suggestion_data TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (commenter_email) REFERENCES user_data(email) ON DELETE CASCADE
            )
        `);

        // Create note_ratings table
        db.run(`
            CREATE TABLE IF NOT EXISTS note_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_id INTEGER NOT NULL,
                rater_email TEXT NOT NULL,
                rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
                UNIQUE(note_id, rater_email),
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (rater_email) REFERENCES user_data(email) ON DELETE CASCADE
            )
        `);

        console.log("Local database tables initialized");
    });
}

/**
 * Promisifies sqlite3 query for consistency with mysql2/promise
 * Returns [rows, metadata] like mysql2/promise
 */
function promisifyQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        if (sql.trim().toUpperCase().startsWith("SELECT")) {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve([rows || []]);
            });
        } else {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else {
                    resolve([{ lastID: this.lastID, changes: this.changes }]);
                }
            });
        }
    });
}

module.exports = {
    query: promisifyQuery,
    close: () => {
        return new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                else {
                    console.log("Local database connection closed");
                    resolve();
                }
            });
        });
    }
};
