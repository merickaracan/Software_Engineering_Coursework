module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/coverage/"
  ],
  collectCoverageFrom: [
    "routes/**/*.js",
    "middleware/**/*.js",
    "services/**/*.js",
    "database/**/*.js",
    "!**/__tests__/**",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/coverage/**",
    "!**/*.test.js",
    "!jest.config.js",
    "!index.js",
    "!app.js"
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
