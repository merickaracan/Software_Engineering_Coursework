const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create or open SQLite database
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Promisify db.run and db.all for easier use with async/await
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Match mysql2's db.query contract used by existing routes/services:
// - SELECT-like statements => [rows]
// - INSERT/UPDATE/DELETE => [{ insertId, affectedRows }]
const dbQuery = async (sql, params = []) => {
  const trimmed = String(sql || '').trim();
  const isReadQuery = /^(SELECT|PRAGMA|WITH)\b/i.test(trimmed);

  if (isReadQuery) {
    const rows = await dbAll(sql, params);
    return [rows];
  }

  const result = await dbRun(sql, params);
  return [{
    insertId: result.id,
    affectedRows: result.changes,
  }];
};

// Setup database schema
async function setupDatabase() {
  try {
    // Create user_data table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS user_data (
        email     TEXT PRIMARY KEY,
        name      TEXT NOT NULL DEFAULT '',
        passkey   TEXT NOT NULL,
        lecturer  INTEGER NOT NULL DEFAULT 0,
        points    INTEGER NOT NULL DEFAULT 0,
        profile_picture TEXT
      )
    `);
    console.log('✅ user_data table ready');

    // Create notes table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS notes (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        email          TEXT NOT NULL,
        verified       INTEGER NOT NULL DEFAULT 0,
        note_data      TEXT,
        rating_average REAL NOT NULL DEFAULT 0,
        number_ratings INTEGER NOT NULL DEFAULT 0,
        module         TEXT,
        note_title     TEXT,
        FOREIGN KEY (email) REFERENCES user_data(email)
      )
    `);
    console.log('✅ notes table ready');

    // Create Suggestions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS Suggestions (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id         INTEGER NOT NULL,
        commenter_id    TEXT NOT NULL,
        suggestion_data TEXT NOT NULL,
        note_owner_id   TEXT NOT NULL,
        FOREIGN KEY (note_id) REFERENCES notes(id),
        FOREIGN KEY (commenter_id) REFERENCES user_data(email),
        FOREIGN KEY (note_owner_id) REFERENCES user_data(email)
      )
    `);
    console.log('✅ Suggestions table ready');

    // Create note_ratings table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS note_ratings (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id     INTEGER NOT NULL,
        rater_email TEXT NOT NULL,
        rating      REAL NOT NULL,
        UNIQUE(note_id, rater_email),
        FOREIGN KEY (note_id) REFERENCES notes(id),
        FOREIGN KEY (rater_email) REFERENCES user_data(email)
      )
    `);
    console.log('✅ note_ratings table ready');

    // Create note_files table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS note_files (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id       INTEGER NOT NULL,
        filename      TEXT NOT NULL,
        stored_name   TEXT NOT NULL,
        file_size     INTEGER NOT NULL,
        file_type     TEXT NOT NULL,
        file_extension TEXT NOT NULL,
        uploaded_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes(id)
      )
    `);
    console.log('✅ note_files table ready');

    console.log('✅ Database initialization complete');
  } catch (err) {
    console.error('❌ Database setup error:', err.message);
    throw err;
  }
}

// Initialize database on startup
setupDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Export database utilities
module.exports = {
  db,
  query: dbQuery,
  run: dbRun,
  get: dbGet,
  setupDatabase
};
