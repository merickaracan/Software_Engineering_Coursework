const db = require("./db");

async function setupDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS user_data (
      email     VARCHAR(255) PRIMARY KEY,
      name      VARCHAR(255) NOT NULL DEFAULT '',
      passkey   VARCHAR(255) NOT NULL,
      lecturer  TINYINT(1)   NOT NULL DEFAULT 0,
      points    INT          NOT NULL DEFAULT 0
    )
  `);

  const [nameCols] = await db.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'user_data' AND column_name = 'name'
  `);
  if (nameCols.length === 0) {
    await db.query(`ALTER TABLE user_data ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT ''`);
    console.log("✅ Added name column to user_data");
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      email          VARCHAR(255) NOT NULL,
      verified       TINYINT(1)   NOT NULL DEFAULT 0,
      note_data      TEXT,
      rating_average DECIMAL(4,2) NOT NULL DEFAULT 0,
      number_ratings INT          NOT NULL DEFAULT 0,
      module         VARCHAR(50),
      note_title     VARCHAR(255)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS Suggestions (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      note_id         INT          NOT NULL,
      commenter_id    VARCHAR(255) NOT NULL,
      suggestion_data TEXT         NOT NULL,
      note_owner_id   VARCHAR(255) NOT NULL
    )
  `);

  const [noteIdCols] = await db.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'Suggestions' AND column_name = 'note_id'
  `);
  if (noteIdCols.length === 0) {
    await db.query(`ALTER TABLE Suggestions ADD COLUMN note_id INT NOT NULL DEFAULT 0`);
    console.log("✅ Added note_id column to Suggestions");
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS note_ratings (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      note_id      INT          NOT NULL,
      rater_email  VARCHAR(255) NOT NULL,
      rating       DECIMAL(3,1) NOT NULL,
      UNIQUE KEY uq_note_rater (note_id, rater_email)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS note_files (
      id           INT AUTO_INCREMENT PRIMARY KEY,
      note_id      INT          NOT NULL,
      filename     VARCHAR(255) NOT NULL,
      stored_name  VARCHAR(255) NOT NULL,
      uploaded_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Database tables ready");
}

module.exports = setupDatabase;
