const request = require("supertest");
const app = require("../app");
const db = require("../db");

jest.mock("../db");

describe("Suggestions Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/suggestions/:id", () => {
    it("should fetch a suggestion by ID", async () => {
      const suggestionId = 1;
      const mockSuggestion = {
        id: suggestionId,
        commenter_id: 10,
        suggestion_data: "Consider adding more examples",
        note_owner_id: 5,
      };

      db.query.mockResolvedValueOnce([[mockSuggestion]]);

      const res = await request(app).get(`/api/suggestions/${suggestionId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data[0]).toEqual(mockSuggestion);
    });

    it("should return empty array if suggestion not found", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/suggestions/999");

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
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
          commenter_id: commenterId,
          suggestion_data: "Suggestion 1",
          note_owner_id: 5,
        },
        {
          id: 2,
          commenter_id: commenterId,
          suggestion_data: "Suggestion 2",
          note_owner_id: 6,
        },
      ];

      db.query.mockResolvedValueOnce([mockSuggestions]);

      const res = await request(app).get(`/api/suggestions/commenter/${commenterId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual(mockSuggestions);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM Suggestions WHERE commenter_id = ?",
        [commenterId]
      );
    });

    it("should return empty array if commenter has no suggestions", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/suggestions/commenter/999");

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("POST /api/suggestions", () => {
    it("should create a new suggestion", async () => {
      const suggestionData = {
        commenter_id: 10,
        suggestion_data: "Great note, needs more examples",
        note_owner_id: 5,
      };

      db.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app).post("/api/suggestions").send(suggestionData);

      expect(res.statusCode).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Suggestion created");
      expect(res.body.insertId).toBe(1);
    });

    it("should handle missing required fields", async () => {
      const incompleteSuggestion = {
        commenter_id: 10,
        // missing suggestion_data and note_owner_id
      };

      db.query.mockResolvedValueOnce([{ insertId: 2 }]);

      const res = await request(app).post("/api/suggestions").send(incompleteSuggestion);

      expect(res.statusCode).toBe(201);
      expect(res.body.ok).toBe(true);
    });

    it("should handle database errors", async () => {
      db.query.mockRejectedValueOnce(new Error("DB insert failed"));

      const res = await request(app).post("/api/suggestions").send({});

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("PUT /api/suggestions/:id", () => {
    it("should update a suggestion", async () => {
      const suggestionId = 1;
      const updateData = {
        commenter_id: 10,
        suggestion_data: "Updated suggestion text",
        note_owner_id: 5,
      };

      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put(`/api/suggestions/${suggestionId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Suggestion updated");
    });

    it("should return 404 if suggestion not found", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).put("/api/suggestions/999").send({});

      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toBe("Suggestion not found");
    });

    it("should handle database errors", async () => {
      db.query.mockRejectedValueOnce(new Error("DB update failed"));

      const res = await request(app).put("/api/suggestions/1").send({});

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("DELETE /api/suggestions/:id", () => {
    it("should delete a suggestion", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).delete("/api/suggestions/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Suggestion deleted");
    });

    it("should return 404 if suggestion not found", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).delete("/api/suggestions/999");

      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toBe("Suggestion not found");
    });

    it("should handle database errors", async () => {
      db.query.mockRejectedValueOnce(new Error("DB delete failed"));

      const res = await request(app).delete("/api/suggestions/1");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });
});
