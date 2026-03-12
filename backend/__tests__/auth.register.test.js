const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");

jest.mock("../services/userService");

const makeEmail = (label = "user") =>
  `test.${label}.${Date.now()}.${Math.floor(Math.random() * 10000)}@bath.ac.uk`;

describe("Registration tests:", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Register new user (valid)", async () => {
    const { getUser, createUser } = require("../services/userService");
    const email = makeEmail("valid");

    getUser.mockResolvedValueOnce(null);
    createUser.mockResolvedValueOnce({ insertId: 1 });

    const res = await request(app)
      .post("/api/register")
      .send({
        name: "Test User",
        email,
        password: "Password123!",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.message).toBe("Account created successfully");
    expect(createUser).toHaveBeenCalledWith(email, expect.any(String), "Test User", 0);
    expect(createUser.mock.calls[0][1]).not.toBe("Password123!");
    expect(await bcrypt.compare("Password123!", createUser.mock.calls[0][1])).toBe(true);
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

    getUser.mockResolvedValueOnce({ email, name: "Test User" });

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
