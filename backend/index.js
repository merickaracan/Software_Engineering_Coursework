const app = require("./app");
const setupDatabase = require("./setupDb");

setupDatabase()
  .then(() => {
    app.listen(3000, () => {
      console.log("Backend running on http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialise database:", err.message);
    process.exit(1);
  });
