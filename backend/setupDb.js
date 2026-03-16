const db = require("./database/db");

async function setupDatabase() {
  await db.ready;
}

module.exports = setupDatabase;