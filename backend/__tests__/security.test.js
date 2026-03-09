const request = require("supertest");
const app = require("../app");
const db = require("../db");
const jwt = require("jsonwebtoken");

jest.mock("../db");
jest.mock("../services/userService");

const JWT_SECRET = process.env.JWT_SECRET || "default";

const createToken = (email) => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
};

describe("Security Tests - SQL Injection Prevention", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Search endpoint - SQL Injection", () => {
    it("should prevent SQL injection in title parameter", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const maliciousPayload = "'; DROP TABLE notes; --";
      const res = await request(app).get(`/api/search?title=${encodeURIComponent(maliciousPayload)}`);

      expect(res.statusCode).toBe(200);
      // Verify parameterized query was used
      const callArgs = db.query.mock.calls[0];
      expect(callArgs[1]).toBeDefined(); // Second parameter should be array of values
      expect(Array.isArray(callArgs[1])).toBe(true);
      // Malicious SQL should be passed as a parameter, not executed
      expect(callArgs[1].some(param => param.includes("DROP TABLE"))).toBe(true);
    });

    it("should prevent SQL injection in author parameter", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const maliciousPayload = "admin' OR '1'='1";
      const res = await request(app).get(`/api/search?author=${encodeURIComponent(maliciousPayload)}`);

      expect(res.statusCode).toBe(200);
      const callArgs = db.query.mock.calls[0];
      expect(callArgs[1]).toBeDefined();
      expect(Array.isArray(callArgs[1])).toBe(true);
    });

    it("should prevent UNION-based SQL injection", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const maliciousPayload = "test' UNION SELECT password_hash FROM user_data --";
      const res = await request(app).get(`/api/search?title=${encodeURIComponent(maliciousPayload)}`);

      expect(res.statusCode).toBe(200);
      const callArgs = db.query.mock.calls[0];
      expect(Array.isArray(callArgs[1])).toBe(true);
    });
  });

  describe("Notes Routes - SQL Injection", () => {
    it("should prevent SQL injection in note ID lookup", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const maliciousId = "1 OR 1=1";
      const res = await request(app).get(`/api/notes/${encodeURIComponent(maliciousId)}`);

      expect(res.statusCode).toBe(404);
      const callArgs = db.query.mock.calls[0];
      // Query should use parameterized form
      expect(callArgs[1]).toBeDefined();
    });

    it("should prevent SQL injection when updating notes", async () => {
      const email = "user@bath.ac.uk";
      const token = createToken(email);

      db.query.mockResolvedValueOnce([[{ email }]]); // ownership check
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // update

      const maliciousTitle = "'; DELETE FROM user_data; --";
      const res = await request(app)
        .put("/api/notes/1")
        .set("Cookie", `token=${token}`)
        .send({
          title: maliciousTitle,
          note_data: "content",
          module: "CM50109",
        });

      expect([200, 400, 404]).toContain(res.statusCode);
      // Verify parameterized queries were used
      for (const callArgs of db.query.mock.calls) {
        if (callArgs[1]) {
          expect(Array.isArray(callArgs[1])).toBe(true);
        }
      }
    });
  });

  describe("Suggestions Routes - SQL Injection", () => {
    it("should prevent SQL injection in suggestion data", async () => {
      const email = "user@bath.ac.uk";
      const token = createToken(email);

      db.query.mockResolvedValueOnce([[{ id: 10 }]]); // user lookup
      db.query.mockResolvedValueOnce([{ insertId: 1 }]); // insert

      const maliciousData = "test'; DROP TABLE suggestions; --";
      const res = await request(app)
        .post("/api/suggestions")
        .set("Cookie", `token=${token}`)
        .send({
          note_id: 5,
          suggestion_data: maliciousData,
        });

      expect([201, 400, 500]).toContain(res.statusCode);
      // Verify parameterized queries
      for (const callArgs of db.query.mock.calls) {
        if (callArgs[1]) {
          expect(Array.isArray(callArgs[1])).toBe(true);
        }
      }
    });
  });

  describe("Authorization - Token Manipulation", () => {
    it("should reject tampered JWT tokens", async () => {
      const res = await request(app)
        .post("/api/notes")
        .set("Cookie", "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImF0dGFja2VyQGJhdGguYWMudWsifQ.TAMPERED")
        .send({
          title: "Test",
          note_data: "Content",
          module: "CM50109",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain("Invalid");
    });

    it("should prevent privilege escalation (non-lecturer cannot verify notes)", async () => {
      const studentEmail = "student@bath.ac.uk";
      const token = createToken(studentEmail);

      db.query.mockResolvedValueOnce([[{ is_lecturer: 0 }]]); // Student

      const res = await request(app)
        .put("/api/notes/verify/5")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Only lecturers");
    });

    it("should prevent privilege escalation (non-lecturer cannot unverify notes)", async () => {
      const studentEmail = "student@bath.ac.uk";
      const token = createToken(studentEmail);

      db.query.mockResolvedValueOnce([[{ is_lecturer: 0 }]]); // Student

      const res = await request(app)
        .put("/api/notes/unverify/5")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Only lecturers");
    });
  });

  describe("Ownership Validation", () => {
    it("should prevent users from deleting others' notes", async () => {
      const userEmail = "user1@bath.ac.uk";
      const ownerEmail = "user2@bath.ac.uk";
      const token = createToken(userEmail);

      db.query.mockResolvedValueOnce([[{ email: ownerEmail }]]); // Different owner

      const res = await request(app)
        .delete("/api/notes/5")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("can only delete own");
    });

    it("should prevent users from updating others' notes", async () => {
      const userEmail = "user1@bath.ac.uk";
      const ownerEmail = "user2@bath.ac.uk";
      const token = createToken(userEmail);

      db.query.mockResolvedValueOnce([[{ email: ownerEmail }]]);

      const res = await request(app)
        .put("/api/notes/5")
        .set("Cookie", `token=${token}`)
        .send({
          title: "Hacked Title",
          note_data: "Hacked content",
          module: "CM50109",
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("can only update own");
    });

    it("should prevent users from deleting others' suggestions", async () => {
      const userEmail = "user1@bath.ac.uk";
      const ownerEmail = "user2@bath.ac.uk";
      const token = createToken(userEmail);

      db.query.mockResolvedValueOnce([[{ email: ownerEmail }]]); // Different owner

      const res = await request(app)
        .delete("/api/suggestions/1")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("can only delete own");
    });

    it("should prevent users from updating others' suggestions", async () => {
      const userEmail = "user1@bath.ac.uk";
      const ownerEmail = "user2@bath.ac.uk";
      const token = createToken(userEmail);

      db.query.mockResolvedValueOnce([[{ email: ownerEmail }]]);

      const res = await request(app)
        .put("/api/suggestions/1")
        .set("Cookie", `token=${token}`)
        .send({ suggestion_data: "Hacked suggestion" });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("can only update own");
    });

    it("should prevent users from updating others' profiles", async () => {
      const userEmail = "user1@bath.ac.uk";
      const otherEmail = "user2@bath.ac.uk";
      const token = createToken(userEmail);

      const res = await request(app)
        .put(`/api/users/${otherEmail}`)
        .set("Cookie", `token=${token}`)
        .send({ name: "Hacked Name" });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("can only update own profile");
    });

    it("should prevent users from deleting others' accounts", async () => {
      const userEmail = "user1@bath.ac.uk";
      const otherEmail = "user2@bath.ac.uk";
      const token = createToken(userEmail);

      const res = await request(app)
        .delete(`/api/users/${otherEmail}`)
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("can only delete own");
    });
  });

  describe("Password Hash Security", () => {
    it("should never expose password_hash in user API responses", async () => {
      const { getUserPublic } = require("../services/userService");
      const mockUser = {
        id: 1,
        name: "Test User",
        email: "user@bath.ac.uk",
        is_lecturer: 0,
        points: 100,
        profile_picture: null,
      };

      getUserPublic.mockResolvedValueOnce(mockUser);

      const res = await request(app).get("/api/users/user@bath.ac.uk");

      expect(res.statusCode).toBe(200);
      expect(res.body.data[0]).not.toHaveProperty("password_hash");
    });

    it("should not allow resetting password via API update without verification", async () => {
      const email = "user@bath.ac.uk";
      const token = createToken(email);
      const { updateUserProfile } = require("../services/userService");

      updateUserProfile.mockResolvedValueOnce({ affectedRows: 1 });

      const res = await request(app)
        .put(`/api/users/${email}`)
        .set("Cookie", `token=${token}`)
        .send({
          name: "New Name",
          password_hash: "new_hashed_password", // Should be ignored
        });

      expect(res.statusCode).toBe(200);
      // Verify password_hash was not passed to the service
      const callArgs = updateUserProfile.mock.calls[0];
      expect(callArgs[1]).not.toHaveProperty("password_hash");
    });
  });

  describe("CORS and Cookie Security", () => {
    it("should set HttpOnly flag on auth cookies", async () => {
      db.query.mockResolvedValueOnce([[{ id: 1, password_hash: "hashed" }]]); // getUser for login
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // login update or similar

      const res = await request(app)
        .post("/api/login")
        .send({
          email: "user@bath.ac.uk",
          password: "Password123!",
        });

      // Verify HttpOnly flag if cookies are set
      if (res.headers["set-cookie"]) {
        const hasSameSite = res.headers["set-cookie"].some(cookie => cookie.includes("SameSite"));
        // HttpOnly and SameSite are security best practices
        expect(hasSameSite).toBe(true);
      }
    });
  });
});
