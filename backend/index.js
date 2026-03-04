const app = require("./app");
const localDb = require("./localDb");

// Wait for database to be initialized before starting server
localDb.waitForDbReady().then(() => {
  app.listen(3000, () => {
    console.log("Backend running on http://localhost:3000");
  });
}).catch((err) => {
  console.error("Failed to start server - database initialization failed:", err.message);
  process.exit(1);
});