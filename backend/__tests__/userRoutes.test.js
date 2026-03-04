const request = require("supertest");
const app = require("../app");
const db = require("../db");

jest.mock("../db");

describe("User Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/users/:email", () => {
    it("should fetch a user by email", async () => {
      const email = "user@bath.ac.uk";
      const mockUser = {
        email,
        passkey: "hashed_password",
        lecturer: 0,
        points: 100,
      };

      db.query.mockResolvedValueOnce([[mockUser]]);

      const res = await request(app).get(`/api/users/${email}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data[0]).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM user_data WHERE email = ?", [
        email,
      ]);
    });

    it("should return empty array if user not found", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/users/notfound@bath.ac.uk");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it("should handle database errors", async () => {
      db.query.mockRejectedValueOnce(new Error("DB connection failed"));

      const res = await request(app).get("/api/users/user@bath.ac.uk");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("POST /api/users", () => {
    it("should create a new user", async () => {
      const userData = {
        email: "newuser@bath.ac.uk",
        passkey: "hashed_password_123",
        lecturer: 0,
        points: 0,
      };

      db.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app).post("/api/users").send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("User created");
      expect(res.body.insertId).toBe(1);
    });

    it("should handle missing required fields", async () => {
      const incompleteUser = {
        email: "user@bath.ac.uk",
        // missing passkey
      };

      db.query.mockResolvedValueOnce([{ insertId: 2 }]);

      const res = await request(app).post("/api/users").send(incompleteUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.ok).toBe(true);
    });

    it("should handle database errors", async () => {
      db.query.mockRejectedValueOnce(new Error("Duplicate email error"));

      const res = await request(app).post("/api/users").send({
        email: "duplicate@bath.ac.uk",
        passkey: "password",
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("PUT /api/users/:email", () => {
    it("should update a user", async () => {
      const email = "user@bath.ac.uk";
      const updateData = {
        passkey: "new_hashed_password",
        lecturer: 1,
        points: 150,
      };

      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).put(`/api/users/${email}`).send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("User updated");
    });

    it("should return 404 if user not found", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).put("/api/users/nonexistent@bath.ac.uk").send({});

      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toBe("User not found");
    });

    it("should handle partial updates", async () => {
      const email = "user@bath.ac.uk";

      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put(`/api/users/${email}`)
        .send({ points: 200 });

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it("should handle database errors", async () => {
      db.query.mockRejectedValueOnce(new Error("DB update failed"));

      const res = await request(app).put("/api/users/user@bath.ac.uk").send({});

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("DELETE /api/users/:email", () => {
    it("should delete a user", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).delete("/api/users/user@bath.ac.uk");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("User deleted");
      expect(db.query).toHaveBeenCalledWith("DELETE FROM user_data WHERE email = ?", [
        "user@bath.ac.uk",
      ]);
    });

    it("should return 404 if user not found", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).delete("/api/users/nonexistent@bath.ac.uk");

      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toBe("User not found");
    });

    it("should handle database errors", async () => {
      db.query.mockRejectedValueOnce(new Error("DB delete failed"));

      const res = await request(app).delete("/api/users/user@bath.ac.uk");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });
});





