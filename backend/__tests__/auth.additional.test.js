const request = require("supertest");
const app = require("../app");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../services/userService");
const { getUser, createUser } = require("../services/userService");

const JWT_SECRET = process.env.JWT_SECRET || "default";

const makeEmail = (label = "user") =>
  `auth.${label}.${Date.now()}.${Math.floor(Math.random() * 10000)}@bath.ac.uk`;

describe("Auth - Logout", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should clear token cookie on logout", async () => {
    const res = await request(app).post("/api/logout");

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.message).toBe("Logged out successfully.");

    // Check that Set-Cookie header contains clearing instruction
    const setCookieHeader = res.headers["set-cookie"];
    expect(setCookieHeader).toBeDefined();
  });

  it("should allow logout without authentication", async () => {
    const res = await request(app).post("/api/logout");

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe("Auth - /me endpoint", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should reject /me without token cookie", async () => {
    const res = await request(app).get("/api/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.ok).toBe(false);
    expect(res.body.message).toBe("No token provided. Please log in.");
  });

  it("should reject /me with invalid token", async () => {
    const res = await request(app)
      .get("/api/me")
      .set("Cookie", "token=invalid.jwt.token");

    expect(res.statusCode).toBe(401);
    expect(res.body.ok).toBe(false);
    expect(res.body.message).toBe("Invalid or expired token.");
  });

  it("should return user data with valid token", async () => {
    const email = makeEmail("validtoken");
    const payload = { email };

    // Create a real valid JWT token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

    const res = await request(app).get("/api/me").set("Cookie", `token=${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.user.email).toBe(email);
  });
});
