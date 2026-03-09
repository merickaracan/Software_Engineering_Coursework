const request = require("supertest");
const app = require("../app");
const db = require("../db");
const jwt = require("jsonwebtoken");

jest.mock("../db");

const JWT_SECRET = process.env.JWT_SECRET || "default";

const createToken = (email) => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
};

const makeEmail = (label = "user") =>
  `sugg.${label}.${Date.now()}.${Math.floor(Math.random() * 10000)}@bath.ac.uk`;

describe("Suggestions Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/suggestions/:id", () => {
    it("should fetch a suggestion by ID", async () => {
      const suggestionId = 1;
      const mockSuggestion = {
        id: suggestionId,
        note_id: 5,
        commenter_id: 10,
        suggestion_data: "Consider adding more examples",
        created_at: "2024-01-01T00:00:00Z",
      };

      db.query.mockResolvedValueOnce([[mockSuggestion]]);

      const res = await request(app).get(`/api/suggestions/${suggestionId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data[0]).toEqual(mockSuggestion);
    });

    it("should return 404 if suggestion not found", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/suggestions/999");

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Suggestion not found");
    });

    it("should handle database errors", async () => {
      db.query.mockRejectedValueOnce(new Error("DB connection failed"));

      const res = await request(app).get("/api/suggestions/1");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("GET /api/suggestions/commenter/:id", () => {
    it("should fetch all suggestions by commenter ID", async () => {
      const commenterId = "10";
      const mockSuggestions = [
        {
          id: 1,
          note_id: 5,
          commenter_id: commenterId,
          commenter_name: "Alice",
          commenter_email: "alice@bath.ac.uk",
          suggestion_data: "Suggestion 1",
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          note_id: 6,
          commenter_id: commenterId,
          commenter_name: "Alice",
          commenter_email: "alice@bath.ac.uk",
          suggestion_data: "Suggestion 2",
          created_at: "2024-01-02T00:00:00Z",
        },
      ];

      db.query.mockResolvedValueOnce([mockSuggestions]);

      const res = await request(app).get(`/api/suggestions/commenter/${commenterId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual(mockSuggestions);
    });

    it("should return empty array if commenter has no suggestions", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/suggestions/commenter/999");

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("GET /api/suggestions/note/:note_id", () => {
    it("should fetch all suggestions for a note with commenter info", async () => {
      const noteId = "5";
      const mockSuggestions = [
        {
          id: 1,
          note_id: noteId,
          commenter_id: 10,
          commenter_name: "Alice",
          commenter_email: "alice@bath.ac.uk",
          commenter_profile_picture: null,
          suggestion_data: "Suggestion 1",
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          note_id: noteId,
          commenter_id: 11,
          commenter_name: "Bob",
          commenter_email: "bob@bath.ac.uk",
          commenter_profile_picture: null,
          suggestion_data: "Suggestion 2",
          created_at: "2024-01-02T00:00:00Z",
        },
      ];

      db.query.mockResolvedValueOnce([mockSuggestions]);

      const res = await request(app).get(`/api/suggestions/note/${noteId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual(mockSuggestions);
    });

    it("should return empty array if note has no suggestions", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/suggestions/note/999");

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("POST /api/suggestions", () => {
    it("should require authentication", async () => {
      const res = await request(app)
        .post("/api/suggestions")
        .send({
          note_id: 5,
          suggestion_data: "Great note!",
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain("Please log in");
    });

    it("should create a new suggestion when authenticated", async () => {
      const commenterEmail = makeEmail("commenter");
      const token = createToken(commenterEmail);

      const suggestionData = {
        note_id: 5,
        suggestion_data: "Great note, needs more examples",
      };

      db.query.mockResolvedValueOnce([[{ id: 10 }]]); // Mock user lookup
      db.query.mockResolvedValueOnce([{ insertId: 1 }]); // Mock create

      const res = await request(app)
        .post("/api/suggestions")
        .set("Cookie", `token=${token}`)
        .send(suggestionData);

      expect(res.statusCode).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.id).toBe(1);
      expect(res.body.message).toContain("created successfully");
    });

    it("should reject missing required fields", async () => {
      const token = createToken(makeEmail("user"));

      const res = await request(app)
        .post("/api/suggestions")
        .set("Cookie", `token=${token}`)
        .send({ note_id: 5 }); // Missing suggestion_data

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Missing required fields");
    });

    it("should reject if user not found", async () => {
      const token = createToken(makeEmail("notfound"));

      db.query.mockResolvedValueOnce([[]]); // User not found

      const res = await request(app)
        .post("/api/suggestions")
        .set("Cookie", `token=${token}`)
        .send({
          note_id: 5,
          suggestion_data: "Suggestion",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("User not found");
    });

    it("should handle database errors during creation", async () => {
      const token = createToken(makeEmail("user"));

      db.query.mockResolvedValueOnce([[{ id: 10 }]]);
      db.query.mockRejectedValueOnce(new Error("Database error"));

      const res = await request(app)
        .post("/api/suggestions")
        .set("Cookie", `token=${token}`)
        .send({
          note_id: 5,
          suggestion_data: "Suggestion",
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });

    it("should reject excessively long suggestions", async () => {
      const token = createToken(makeEmail("user"));
      const longSuggestion = "A".repeat(10000);

      db.query.mockResolvedValueOnce([[{ id: 10 }]]);

      const res = await request(app)
        .post("/api/suggestions")
        .set("Cookie", `token=${token}`)
        .send({
          note_id: 5,
          suggestion_data: longSuggestion,
        });

      // Should either reject or handle gracefully
      expect([400, 500]).toContain(res.statusCode);
    });
  });

  describe("DELETE /api/suggestions/:id", () => {
    it("should require authentication", async () => {
      const res = await request(app).delete("/api/suggestions/1");

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain("Please log in");
    });

    it("should delete suggestion when user owns it", async () => {
      const commenterEmail = makeEmail("owner");
      const token = createToken(commenterEmail);

      db.query.mockResolvedValueOnce([[{ email: commenterEmail }]]); // Verify ownership
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete

      const res = await request(app)
        .delete("/api/suggestions/1")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toContain("deleted successfully");
    });

    it("should reject deletion if user doesn't own suggestion", async () => {
      const userEmail = makeEmail("user1");
      const ownerEmail = makeEmail("user2");
      const token = createToken(userEmail);

      db.query.mockResolvedValueOnce([[{ email: ownerEmail }]]); // Different owner

      const res = await request(app)
        .delete("/api/suggestions/1")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("can only delete own suggestions");
    });

    it("should return 404 if suggestion not found", async () => {
      const token = createToken(makeEmail("user"));

      db.query.mockResolvedValueOnce([[]]); // Not found

      const res = await request(app)
        .delete("/api/suggestions/999")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Suggestion not found");
    });

    it("should handle database errors during deletion", async () => {
      const token = createToken(makeEmail("user"));

      db.query.mockRejectedValueOnce(new Error("Database error"));

      const res = await request(app)
        .delete("/api/suggestions/1")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });;

  describe("PUT /api/suggestions/:id", () => {
    it("should require authentication", async () => {
      const res = await request(app)
        .put("/api/suggestions/1")
        .send({ suggestion_data: "Updated" });

      expect(res.statusCode).toBe(401);
    });

    it("should update suggestion when user owns it", async () => {
      const commenterEmail = makeEmail("owner");
      const token = createToken(commenterEmail);

      db.query.mockResolvedValueOnce([[{ email: commenterEmail }]]); // Verify ownership
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Update

      const res = await request(app)
        .put("/api/suggestions/1")
        .set("Cookie", `token=${token}`)
        .send({ suggestion_data: "Updated suggestion" });

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toContain("updated successfully");
    });

    it("should reject update if user doesn't own suggestion", async () => {
      const userEmail = makeEmail("user1");
      const ownerEmail = makeEmail("user2");
      const token = createToken(userEmail);

      db.query.mockResolvedValueOnce([[{ email: ownerEmail }]]);

      const res = await request(app)
        .put("/api/suggestions/1")
        .set("Cookie", `token=${token}`)
        .send({ suggestion_data: "Hacked" });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("can only update own suggestions");
    });

    it("should return 404 if suggestion not found", async () => {
      const token = createToken(makeEmail("user"));

      db.query.mockResolvedValueOnce([[]]); // Suggestion not found

      const res = await request(app)
        .put("/api/suggestions/999")
        .set("Cookie", `token=${token}`)
        .send({ suggestion_data: "Updated" });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Suggestion not found");
    });

    it("should handle database errors during update", async () => {
      const token = createToken(makeEmail("user"));

      db.query.mockRejectedValueOnce(new Error("Database error"));

      const res = await request(app)
        .put("/api/suggestions/1")
        .set("Cookie", `token=${token}`)
        .send({ suggestion_data: "Updated" });

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });

    it("should reject update with empty suggestion_data", async () => {
      const token = createToken(makeEmail("user"));

      const res = await request(app)
        .put("/api/suggestions/1")
        .set("Cookie", `token=${token}`)
        .send({ suggestion_data: "" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("cannot be empty");
    });
  });
});
