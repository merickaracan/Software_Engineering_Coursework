const request = require("supertest");
const app = require("../app");

jest.mock("../services/userService");

// Helper to generate unique Bath email addresses for testing, avoids "Duplicate email" errors
const makeEmail = (label = "user") =>
  `test.${label}.${Date.now()}.${Math.floor(Math.random() * 10000)}@bath.ac.uk`;

describe("Registration tests:", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Register new user (valid)", async () => {
    const { getUser, createUser } = require("../services/userService");
    
    const email = makeEmail("valid");
    getUser.mockResolvedValueOnce(null); // User doesn't exist
    createUser.mockResolvedValueOnce({ insertId: 1 }); // Create succeeds
    
    const res = await request(app)
      .post("/api/register")
      .send({
        name: "Test User",
        email,
        password: "Password123!",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
  });

  test("Rejects missing name", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        name: "",
        email: makeEmail("noname"),
        password: "Password123!",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.errors).toContain("Name is required.");
  });

  test("Rejects invalid Bath email", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        name: "Test User",
        email: "user@gmail.com",
        password: "Password123!",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.errors).toContain(
      "Email must be a valid Bath University address (e.g., user@bath.ac.uk)."
    );
  });

  test("Rejects weak password", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        name: "Test User",
        email: makeEmail("weakpw"),
        password: "password",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.errors).toContain("Must contain at least one uppercase letter.");
    expect(res.body.errors).toContain("Must contain at least one number.");
    expect(res.body.errors).toContain("Must contain at least one symbol.");
  });

  test("Rejects duplicate email", async () => {
    const { getUser } = require("../services/userService");
    
    const email = makeEmail("dupe");
    // First call returns null, second call returns existing user (simulating duplicate)
    getUser.mockResolvedValueOnce(null); // First registration: user doesn't exist
    getUser.mockResolvedValueOnce({ id: 1, email, name: "Test User" }); // Second registration: user exists

    const res1 = await request(app)
      .post("/api/register")
      .send({
        name: "Test User",
        email,
        password: "Password123!",
      });

    expect(res1.statusCode).toBe(201);

    const res = await request(app)
      .post("/api/register")
      .send({
        name: "Test User",
        email,
        password: "Password123!",
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.ok).toBe(false);
    expect(res.body.errors).toContain("Email is already registered.");
  });
});
