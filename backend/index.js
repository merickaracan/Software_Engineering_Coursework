const app = require("./app");
const db = require("./database/db");

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});