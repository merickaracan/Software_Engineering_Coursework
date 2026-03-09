module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/__tests__/**",
    "!**/index.js",
    "!**/app.js"
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  testMatch: ["**/__tests__/**/*.test.js"],
  verbose: true
};
