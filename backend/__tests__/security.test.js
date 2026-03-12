const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = require("../app");
const db = require("../database/db");
const userService = require("../services/userService");

jest.mock("../database/db");
jest.mock("../services/userService");

const JWT_SECRET = process.env.JWT_SECRET || "default";

const createToken = (email) => jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });

describe("Security Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("SQL injection prevention", () => {
    it("parameterizes search inputs", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const maliciousPayload = "'; DROP TABLE notes; --";
      const res = await request(app).get(`/api/search?title=${encodeURIComponent(maliciousPayload)}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(db.query.mock.calls[0][1])).toBe(true);
      expect(db.query.mock.calls[0][1][0]).toContain("DROP TABLE");
    });

    it("parameterizes note ID lookup", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get(`/api/notes/${encodeURIComponent("1 OR 1=1")}`);

      expect(res.statusCode).toBe(200);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining("WHERE notes.id = ?"), ["1 OR 1=1"]);
    });

    it("parameterizes suggestion creation", async () => {
      const token = createToken("user@bath.ac.uk");
      db.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app)
        .post("/api/suggestions")
        .set("Cookie", `token=${token}`)
        .send({
          note_id: 5,
          commenter_id: 1,
          suggestion_data: "test'; DROP TABLE Suggestions; --",
          note_owner_id: 3,
        });

      expect(res.statusCode).toBe(201);
      expect(Array.isArray(db.query.mock.calls[0][1])).toBe(true);
    });
  });

  describe("Authentication and authorization", () => {
    it("rejects tampered JWT tokens", async () => {
      const res = await request(app)
        .post("/api/notes")
        .set(
          "Cookie",
          "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImF0dGFja2VyQGJhdGguYWMudWsifQ.TAMPERED"
        )
        .send({});

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid or expired token.");
    });

    it("prevents users from updating other profiles", async () => {
      const token = createToken("user1@bath.ac.uk");

      const res = await request(app)
        .put("/api/users/user2@bath.ac.uk")
        .set("Cookie", `token=${token}`)
        .send({ name: "Hacked Name" });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("can only update own profile");
    });

    it("prevents users from deleting other accounts", async () => {
      const token = createToken("user1@bath.ac.uk");

      const res = await request(app)
        .delete("/api/users/user2@bath.ac.uk")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("can only delete own account");
    });
  });

  describe("Cookie security", () => {
    it("sets HttpOnly auth cookies on successful login", async () => {
      const email = "user@bath.ac.uk";
      const passkey = await bcrypt.hash("Password123!", 12);
      userService.getUser.mockResolvedValueOnce({ email, name: "User", passkey });

      const res = await request(app)
        .post("/api/login")
        .send({ email, password: "Password123!" });

      expect(res.statusCode).toBe(200);
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"][0]).toContain("HttpOnly");
      expect(res.headers["set-cookie"][0]).toContain("SameSite=Strict");
    });
  });
});
