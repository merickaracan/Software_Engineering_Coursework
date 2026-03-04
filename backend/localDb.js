const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create/connect to local SQLite database
const dbPath = path.join(__dirname, "local.db");

let db;
let dbReady = false;

const dbReadyPromise = new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error("Error opening local database:", err.message);
            reject(err);
        } else {
            console.log("Connected to local SQLite database at:", dbPath);
            initializeLocalDatabase()
                .then(() => {
                    dbReady = true;
                    resolve();
                })
                .catch(reject);
        }
    });
});

/**
 * Initialize local database with tables if they don't exist
 * Returns a promise that resolves when all tables and indexes are created
 */
function initializeLocalDatabase() {
    return new Promise((resolve, reject) => {
        let completed = 0;
        const total = 5; // 4 tables + user_data schema migration check

        const checkCompletion = () => {
            completed++;
            if (completed === total) {
                console.log("Local database tables initialized");
                resolve();
            }
        };

        // Create user_data table
        db.run(`
            CREATE TABLE IF NOT EXISTS user_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                is_lecturer INTEGER NOT NULL DEFAULT 0 CHECK (is_lecturer IN (0,1)),
                points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
                password_hash TEXT NOT NULL,
                profile_picture TEXT
            )
        `, (err) => {
            if (err) {
                console.error("Error creating user_data table:", err.message);
                reject(err);
            } else {
                checkCompletion();
            }
        });

        // Create notes table
        db.run(`
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                is_verified INTEGER NOT NULL DEFAULT 0 CHECK (is_verified IN (0,1)),
                note_data TEXT NOT NULL,
                module TEXT NOT NULL,
                file_name TEXT,
                file_type TEXT,
                file_size INTEGER DEFAULT 0,
                file_data TEXT,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                updated_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (owner_id) REFERENCES user_data(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) {
                console.error("Error creating notes table:", err.message);
                reject(err);
            } else {
                checkCompletion();
            }
        });

        // Create suggestions table
        db.run(`
            CREATE TABLE IF NOT EXISTS suggestions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_id INTEGER NOT NULL,
                commenter_id INTEGER NOT NULL,
                suggestion_data TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (commenter_id) REFERENCES user_data(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) {
                console.error("Error creating suggestions table:", err.message);
                reject(err);
            } else {
                checkCompletion();
            }
        });

        // Create note_ratings table
        db.run(`
            CREATE TABLE IF NOT EXISTS note_ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                note_id INTEGER NOT NULL,
                rater_id INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
                UNIQUE(note_id, rater_id),
                FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY (rater_id) REFERENCES user_data(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) {
                console.error("Error creating note_ratings table:", err.message);
                reject(err);
            } else {
                checkCompletion();
            }
        });

        const ensureUserDataColumns = () => {
            db.all("PRAGMA table_info(user_data)", [], (pragmaErr, columns) => {
                if (pragmaErr) {
                    console.error("Error checking user_data schema:", pragmaErr.message);
                    reject(pragmaErr);
                    return;
                }

                const hasProfilePicture = Array.isArray(columns) && columns.some((col) => col.name === "profile_picture");
                if (hasProfilePicture) {
                    checkCompletion();
                    return;
                }

                db.run("ALTER TABLE user_data ADD COLUMN profile_picture TEXT", (alterErr) => {
                    if (alterErr) {
                        console.error("Error adding profile_picture column:", alterErr.message);
                        reject(alterErr);
                        return;
                    }

                    checkCompletion();
                });
            });
        };

        ensureUserDataColumns();
    });
}

/**
 * Validates JSON data fields
 * @param {string} data - JSON string to validate
 * @param {string} fieldName - Name of field for error messages
 * @throws {Error} if JSON is invalid
 */
function validateJSONData(data, fieldName = "data") {
    try {
        JSON.parse(data);
    } catch (e) {
        throw new Error(`Invalid JSON in ${fieldName}: ${e.message}`);
    }
}

/**
 * Promisifies sqlite3 query with proper parameter binding and error context
 * Returns [rows, metadata] like mysql2/promise
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters for prepared statement
 * @returns {Promise<Array>} [rows, metadata]
 */
function promisifyQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        // Ensure database is ready
        if (!dbReady) {
            return reject(new Error("Database not yet initialized"));
        }

        const trimmedSql = sql.trim().toUpperCase();
        const isSelect = trimmedSql.startsWith("SELECT");

        // Use prepared statements with parameter binding for safety
        if (isSelect) {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    const error = new Error(`Query error: ${err.message}`);
                    error.code = err.code;
                    error.sql = sql;
                    reject(error);
                } else {
                    resolve([rows || []]);
                }
            });
        } else {
            db.run(sql, params, function(err) {
                if (err) {
                    const error = new Error(`Query error: ${err.message}`);
                    error.code = err.code;
                    error.sql = sql;
                    reject(error);
                } else {
                    resolve([
                        {
                            lastID: this.lastID,
                            changes: this.changes,
                            affectedRows: this.changes
                        }
                    ]);
                }
            });
        }
    });
}

/**
 * Waits for database to be initialized
 * @returns {Promise<void>}
 */
function waitForDbReady() {
    return dbReadyPromise;
}

module.exports = {
    query: promisifyQuery,
    validateJSONData,
    waitForDbReady,
    dbReady: () => dbReady,
    close: () => {
        return new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                else {
                    console.log("Local database connection closed");
                    dbReady = false;
                    resolve();
                }
            });
        });
    }
};
