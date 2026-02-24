const db = require("./db");

const tables = ["notes", "suggestions", "user_data"];

async function describeTable(tableName) {
  const [columns] = await db.query(
    "SELECT column_name, data_type, is_nullable, column_default " +
      "FROM information_schema.columns " +
      "WHERE table_schema = DATABASE() AND table_name = ? " +
      "ORDER BY ordinal_position",
    [tableName]
  );

  return columns;
}

async function sampleRows(tableName, limit = 5) {
  const [rows] = await db.query(
    `SELECT * FROM ${tableName} LIMIT ?`,
    [limit]
  );

  return rows;
}

async function main() {
  try {
    for (const tableName of tables) {
      const columns = await describeTable(tableName);
      const rows = await sampleRows(tableName);

      console.log(`\n=== ${tableName} ===`);
      console.table(columns);
      console.log("Sample rows:");
      console.table(rows);
    }
  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await db.end();
  }
}

main();