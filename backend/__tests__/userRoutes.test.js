const request = require("supertest");
const app = require("../app");
const { getUserPublic, getUserById } = require("../services/userService");
const jwt = require("jsonwebtoken");

jest.mock("../services/userService");

const JWT_SECRET = process.env.JWT_SECRET || "default";

const createToken = (email) => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
};

describe("User Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users/id/:id", () => {
    it("should fetch a user by ID (public data only)", async () => {
      const mockUser = {
        id: 1,
        name: "Test User",
        email: "user@bath.ac.uk",
        is_lecturer: 0,
        points: 100,
        profile_picture: null,
      };

      getUserById.mockResolvedValueOnce(mockUser);

      const res = await request(app).get("/api/users/id/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data[0]).toEqual(mockUser);
      // Verify password_hash is not included
      expect(res.body.data[0]).not.toHaveProperty("password_hash");
      expect(getUserById).toHaveBeenCalledWith("1");
    });

    it("should return 404 if user not found", async () => {
      getUserById.mockResolvedValueOnce(null);

      const res = await request(app).get("/api/users/id/999");

      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("User not found");
    });

    it("should handle database errors", async () => {
      getUserById.mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).get("/api/users/id/1");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("GET /api/users/:email", () => {
    it("should fetch a user by email (public data only)", async () => {
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
      expect(res.body.ok).toBe(true);
      expect(res.body.data[0]).toEqual(mockUser);
      // Verify password_hash is NOT included (critical security)
      expect(res.body.data[0]).not.toHaveProperty("password_hash");
      expect(getUserPublic).toHaveBeenCalledWith("user@bath.ac.uk");
    });

    it("should return 404 if user not found", async () => {
      getUserPublic.mockResolvedValueOnce(null);

      const res = await request(app).get("/api/users/notfound@bath.ac.uk");

      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("User not found");
    });

    it("should handle database errors gracefully", async () => {
      getUserPublic.mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).get("/api/users/user@bath.ac.uk");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("PUT /api/users/:email/profile-picture", () => {
    it("should require authentication", async () => {
      const res = await request(app)
        .put("/api/users/user@bath.ac.uk/profile-picture")
        .send({ profile_picture: "base64data" });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain("Please log in");
    });

    it("should require ownership (cannot update others' profiles)", async () => {
      const userEmail = "user1@bath.ac.uk";
      const otherEmail = "user2@bath.ac.uk";
      const token = createToken(userEmail);

      const res = await request(app)
        .put(`/api/users/${otherEmail}/profile-picture`)
        .set("Cookie", `token=${token}`)
        .send({ profile_picture: "base64data" });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Unauthorized");
      expect(res.body.message).toContain("can only update own");
    });

    it("should return 404 if user not found", async () => {
      const email = "user@bath.ac.uk";
      const token = createToken(email);

      // Mock the updateUserProfile to return 0 affected rows (user not found)
      const updateUserProfile = require("../services/userService").updateUserProfile;
      updateUserProfile.mockResolvedValueOnce({ affectedRows: 0 });

      const res = await request(app)
        .put(`/api/users/${email}/profile-picture`)
        .set("Cookie", `token=${token}`)
        .send({ profile_picture: "base64data" });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });

  describe("PUT /api/users/:email", () => {
    it("should require authentication", async () => {
      const res = await request(app)
        .put("/api/users/user@bath.ac.uk")
        .send({ name: "Updated Name" });

      expect(res.statusCode).toBe(401);
    });

    it("should require ownership (cannot update others' accounts)", async () => {
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

    it("should reject invalid name (too short)", async () => {
      const email = "user@bath.ac.uk";
      const token = createToken(email);

      const res = await request(app)
        .put(`/api/users/${email}`)
        .set("Cookie", `token=${token}`)
        .send({ name: "A" }); // Less than 2 characters

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("at least 2 characters");
    });

    it("should return 404 if user not found", async () => {
      const email = "user@bath.ac.uk";
      const token = createToken(email);

      const updateUserProfile = require("../services/userService").updateUserProfile;
      updateUserProfile.mockResolvedValueOnce({ affectedRows: 0 });

      const res = await request(app)
        .put(`/api/users/${email}`)
        .set("Cookie", `token=${token}`)
        .send({ name: "New Name" });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/users/:email", () => {
    it("should require authentication", async () => {
      const res = await request(app).delete("/api/users/user@bath.ac.uk");

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain("Please log in");
    });

    it("should require ownership (cannot delete others' accounts)", async () => {
      const userEmail = "user1@bath.ac.uk";
      const otherEmail = "user2@bath.ac.uk";
      const token = createToken(userEmail);

      const res = await request(app)
        .delete(`/api/users/${otherEmail}`)
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("can only delete own");
    });

    it("should delete user account when user owns it", async () => {
      const email = "user@bath.ac.uk";
      const token = createToken(email);

      const deleteUser = require("../services/userService").deleteUser;
      deleteUser.mockResolvedValueOnce({ affectedRows: 1 });

      const res = await request(app)
        .delete(`/api/users/${email}`)
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toContain("deleted successfully");
    });

    it("should return 404 if user not found", async () => {
      const email = "user@bath.ac.uk";
      const token = createToken(email);

      const deleteUser = require("../services/userService").deleteUser;
      deleteUser.mockResolvedValueOnce({ affectedRows: 0 });

      const res = await request(app)
        .delete(`/api/users/${email}`)
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not found");
    });
  });
});
