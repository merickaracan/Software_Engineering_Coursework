const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const db = require("../database/db");
const userService = require("../services/userService");

jest.mock("../database/db");
jest.mock("../services/userService");

const JWT_SECRET = process.env.JWT_SECRET || "default";

const createToken = (email) => jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });

describe("User Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET routes", () => {
    it("fetches a user by rowid", async () => {
      const rows = [{ id: 1, email: "user@bath.ac.uk", name: "User", lecturer: 0, points: 100, profile_picture: null }];
      db.query.mockResolvedValueOnce([rows]);

      const res = await request(app).get("/api/users/id/1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, data: rows });
    });

    it("fetches a user by email", async () => {
      const rows = [{ email: "user@bath.ac.uk", name: "User", passkey: "hashed" }];
      db.query.mockResolvedValueOnce([rows]);

      const res = await request(app).get("/api/users/user@bath.ac.uk");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, data: rows });
    });
  });

  describe("PUT /api/users/:email/profile-picture", () => {
    it("requires authentication", async () => {
      const res = await request(app)
        .put("/api/users/user@bath.ac.uk/profile-picture")
        .send({ profile_picture: "base64data" });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("No token provided. Please log in.");
    });

    it("requires ownership", async () => {
      const token = createToken("user1@bath.ac.uk");

      const res = await request(app)
        .put("/api/users/user2@bath.ac.uk/profile-picture")
        .set("Cookie", `token=${token}`)
        .send({ profile_picture: "base64data" });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Unauthorized - can only update own profile");
    });

    it("returns 404 if user is missing", async () => {
      const token = createToken("user@bath.ac.uk");
      userService.updateUserProfile.mockResolvedValueOnce({ affectedRows: 0 });

      const res = await request(app)
        .put("/api/users/user@bath.ac.uk/profile-picture")
        .set("Cookie", `token=${token}`)
        .send({ profile_picture: "base64data" });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });

  describe("PUT /api/users/:email", () => {
    it("rejects too-short names", async () => {
      const token = createToken("user@bath.ac.uk");

      const res = await request(app)
        .put("/api/users/user@bath.ac.uk")
        .set("Cookie", `token=${token}`)
        .send({ name: "A" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Name must be at least 2 characters");
    });

    it("updates a user profile", async () => {
      const token = createToken("user@bath.ac.uk");
      userService.updateUserProfile.mockResolvedValueOnce({ affectedRows: 1 });

      const res = await request(app)
        .put("/api/users/user@bath.ac.uk")
        .set("Cookie", `token=${token}`)
        .send({ name: "Updated Name", profile_picture: "img-data" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, message: "User updated successfully" });
      expect(userService.updateUserProfile).toHaveBeenCalledWith("user@bath.ac.uk", {
        name: "Updated Name",
        profile_picture: "img-data",
      });
    });
  });

  describe("DELETE /api/users/:email", () => {
    it("requires ownership", async () => {
      const token = createToken("user1@bath.ac.uk");

      const res = await request(app)
        .delete("/api/users/user2@bath.ac.uk")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Unauthorized - can only delete own account");
    });

    it("deletes a user account", async () => {
      const token = createToken("user@bath.ac.uk");
      userService.deleteUser.mockResolvedValueOnce({ affectedRows: 1 });

      const res = await request(app)
        .delete("/api/users/user@bath.ac.uk")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, message: "User account deleted successfully" });
    });

    it("returns 404 for missing user", async () => {
      const token = createToken("user@bath.ac.uk");
      userService.deleteUser.mockResolvedValueOnce({ affectedRows: 0 });

      const res = await request(app)
        .delete("/api/users/user@bath.ac.uk")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });
});
