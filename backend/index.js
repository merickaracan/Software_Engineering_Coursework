// Possible TODOs:
// - Verify token expiration (e.g., 24 hours)
// - Implement password reset functionality
// - Add rate limiting to prevent brute-force attacks
// - Signed tokens for user login (JWT)
// - Use environment variables for secrets and database configuration

const app = require("./app");

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});