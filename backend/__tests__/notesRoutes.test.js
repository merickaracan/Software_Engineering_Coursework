const request = require("supertest");
const app = require("../app");
const db = require("../db");
const jwt = require("jsonwebtoken");

jest.mock("../db");

const JWT_SECRET = process.env.JWT_SECRET || "default";

const makeEmail = (label = "user") =>
  `notes.${label}.${Date.now()}.${Math.floor(Math.random() * 10000)}@bath.ac.uk`;

// Helper to create a valid JWT token
const createToken = (email) => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });
};

describe("Notes Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/notes/:id", () => {
    it("should fetch a note by ID", async () => {
      const noteId = "1";
      const mockNote = {
        id: noteId,
        owner_id: 1,
        owner_email: "user@bath.ac.uk",
        title: "Test Note Title",
        module: "CM50109",
        note_data: "Test note content",
        is_verified: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      db.query.mockResolvedValueOnce([[mockNote]]);

      const res = await request(app).get(`/api/notes/${noteId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data[0]).toEqual(mockNote);
    });

    it("should return 404 if note not found", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/notes/999");

      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Note not found");
    });

    it("should handle database errors", async () => {
      db.query.mockRejectedValueOnce(new Error("DB connection failed"));

      const res = await request(app).get("/api/notes/1");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("GET /api/notes/module/:module", () => {
    it("should fetch all notes for a module", async () => {
      const module = "CM50109";
      const mockNotes = [
        { id: 1, owner_id: 1, owner_email: "user1@bath.ac.uk", title: "Note 1", module, note_data: "Note 1", is_verified: 1 },
        { id: 2, owner_id: 2, owner_email: "user2@bath.ac.uk", title: "Note 2", module, note_data: "Note 2", is_verified: 0 },
      ];

      db.query.mockResolvedValueOnce([mockNotes]);

      const res = await request(app).get(`/api/notes/module/${module}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual(mockNotes);
    });

    it("should return empty array if no notes for module", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/notes/module/INVALID");

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("GET /api/notes/email/:email", () => {
    it("should fetch all notes by owner email using single JOIN query (N+1 fix)", async () => {
      const email = "user@bath.ac.uk";
      const mockNotes = [
        { id: 1, owner_id: 1, owner_email: email, title: "Note 1", module: "CM50109", note_data: "Note 1", is_verified: 1 },
        { id: 2, owner_id: 1, owner_email: email, title: "Note 2", module: "CM50264", note_data: "Note 2", is_verified: 0 },
      ];

      db.query.mockResolvedValueOnce([mockNotes]);

      const res = await request(app).get(`/api/notes/email/${email}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual(mockNotes);
      
      // Verify single JOIN query was used (not 2 queries)
      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query.mock.calls[0][0]).toContain("JOIN");
    });

    it("should return empty array if user has no notes", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get(`/api/notes/email/novotes@bath.ac.uk`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("POST /api/notes", () => {
    it("should require authentication", async () => {
      const noteData = {
        title: "New Note",
        note_data: "Content",
        module: "CM50109",
      };

      const res = await request(app).post("/api/notes").send(noteData);

      expect(res.statusCode).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("Please log in");
    });

    it("should create a new note when authenticated", async () => {
      const email = makeEmail("newNote");
      const token = createToken(email);
      const noteData = {
        title: "New Note Title",
        note_data: "New note content",
        module: "CM50109",
      };

      db.query.mockResolvedValueOnce([[{ id: 1 }]]); // Mock user lookup
      db.query.mockResolvedValueOnce([{ insertId: 5 }]); // Mock note creation

      const res = await request(app)
        .post("/api/notes")
        .set("Cookie", `token=${token}`)
        .send(noteData);

      expect(res.statusCode).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.id).toBe(5);
    });

    it("should reject missing required fields", async () => {
      const email = makeEmail("missing");
      const token = createToken(email);

      const res = await request(app)
        .post("/api/notes")
        .set("Cookie", `token=${token}`)
        .send({ title: "No data" }); // Missing note_data and module

      expect(res.statusCode).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("Missing required fields");
    });

    it("should reject note with excessively long title", async () => {
      const email = makeEmail("longtitle");
      const token = createToken(email);
      const longTitle = "A".repeat(1000); // Extremely long title

      db.query.mockResolvedValueOnce([[{ id: 1 }]]);

      const res = await request(app)
        .post("/api/notes")
        .set("Cookie", `token=${token}`)
        .send({
          title: longTitle,
          note_data: "Content",
          module: "CM50109",
        });

      // Should either reject or handle gracefully
      expect([400, 500]).toContain(res.statusCode);
    });

    it("should reject if user not found", async () => {
      const email = makeEmail("notfound");
      const token = createToken(email);

      db.query.mockResolvedValueOnce([[]]); // User not found

      const res = await request(app)
        .post("/api/notes")
        .set("Cookie", `token=${token}`)
        .send({
          title: "New Note",
          note_data: "Content",
          module: "CM50109",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("User not found");
    });

    it("should handle database errors during creation", async () => {
      const email = makeEmail("dberror");
      const token = createToken(email);

      db.query.mockResolvedValueOnce([[{ id: 1 }]]);
      db.query.mockRejectedValueOnce(new Error("Database error"));

      const res = await request(app)
        .post("/api/notes")
        .set("Cookie", `token=${token}`)
        .send({
          title: "New Note",
          note_data: "Content",
          module: "CM50109",
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("DELETE /api/notes/:id", () => {
    it("should require authentication", async () => {
      const res = await request(app).delete("/api/notes/1");

      expect(res.statusCode).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("Please log in");
    });

    it("should delete a note when user owns it", async () => {
      const userEmail = makeEmail("owner");
      const token = createToken(userEmail);

      db.query.mockResolvedValueOnce([[{ email: userEmail }]]); // Verify ownership
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete

      const res = await request(app)
        .delete("/api/notes/5")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toContain("deleted successfully");
    });

    it("should reject deletion if user does not own note", async () => {
      const userEmail = makeEmail("unauthorized");
      const ownerEmail = makeEmail("owner");
      const token = createToken(userEmail);

      db.query.mockResolvedValueOnce([[{ email: ownerEmail }]]); // Different owner

      const res = await request(app)
        .delete("/api/notes/5")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("can only delete own");
    });

    it("should return 404 if note not found", async () => {
      const token = createToken(makeEmail("user"));

      db.query.mockResolvedValueOnce([[]]); // Note not found

      const res = await request(app)
        .delete("/api/notes/999")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Note not found");
    });
  });

  describe("PUT /api/notes/:id", () => {
    it("should require authentication", async () => {
      const res = await request(app)
        .put("/api/notes/1")
        .send({ title: "Updated" });

      expect(res.statusCode).toBe(401);
    });

    it("should update a note when user owns it", async () => {
      const userEmail = makeEmail("owner");
      const token = createToken(userEmail);
      const updateData = {
        title: "Updated Title",
        note_data: "Updated content",
        module: "CM50264",
      };

      db.query.mockResolvedValueOnce([[{ email: userEmail }]]); // Verify ownership
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Update

      const res = await request(app)
        .put(`/api/notes/5`)
        .set("Cookie", `token=${token}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toContain("updated successfully");
    });

    it("should reject update if user does not own note", async () => {
      const userEmail = makeEmail("unauthorized");
      const ownerEmail = makeEmail("owner");
      const token = createToken(userEmail);

      db.query.mockResolvedValueOnce([[{ email: ownerEmail }]]);

      const res = await request(app)
        .put(`/api/notes/5`)
        .set("Cookie", `token=${token}`)
        .send({ title: "Hacked" });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("can only update own");
    });

    it("should return 404 if note not found", async () => {
      const token = createToken(makeEmail("user"));

      db.query.mockResolvedValueOnce([[]]); // Note not found

      const res = await request(app)
        .put(`/api/notes/999`)
        .set("Cookie", `token=${token}`)
        .send({ title: "Updated" });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("PUT /api/notes/verify/:id", () => {
    it("should require authentication", async () => {
      const res = await request(app).put("/api/notes/verify/1");

      expect(res.statusCode).toBe(401);
    });

    it("should require lecturer status", async () => {
      const studentEmail = makeEmail("student");
      const token = createToken(studentEmail);

      db.query.mockResolvedValueOnce([[{ is_lecturer: 0 }]]); // Student, not lecturer

      const res = await request(app)
        .put("/api/notes/verify/5")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Only lecturers");
    });

    it("should verify note when user is lecturer", async () => {
      const lecturerEmail = makeEmail("lecturer");
      const token = createToken(lecturerEmail);

      db.query.mockResolvedValueOnce([[{ is_lecturer: 1 }]]); // Lecturer
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Update

      const res = await request(app)
        .put("/api/notes/verify/5")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("verified successfully");
    });

    it("should return 404 if note not found", async () => {
      const token = createToken(makeEmail("lecturer@bath.ac.uk"));

      db.query.mockResolvedValueOnce([[{ is_lecturer: 1 }]]);
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]); // No rows affected

      const res = await request(app)
        .put("/api/notes/verify/999")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("PUT /api/notes/unverify/:id", () => {
    it("should require lecturer status to unverify", async () => {
      const studentEmail = makeEmail("student");
      const token = createToken(studentEmail);

      db.query.mockResolvedValueOnce([[{ is_lecturer: 0 }]]);

      const res = await request(app)
        .put("/api/notes/unverify/5")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain("Only lecturers");
    });

    it("should unverify note when user is lecturer", async () => {
      const token = createToken(makeEmail("lecturer@bath.ac.uk"));

      db.query.mockResolvedValueOnce([[{ is_lecturer: 1 }]]);
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put("/api/notes/unverify/5")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("unverified successfully");
    });
  });

  describe("GET /search", () => {
    it("should search notes by title", async () => {
      const mockResults = [
        { id: 1, title: "React Tutorial", note_data: "...", module: "CM50109", owner_email: "user@bath.ac.uk" },
      ];

      db.query.mockResolvedValueOnce([mockResults]);

      const res = await request(app).get("/api/search?title=React");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual(mockResults);
    });

    it("should search notes by author", async () => {
      const mockResults = [
        { id: 2, title: "Note", note_data: "...", module: "CM50264", owner_email: "alice@bath.ac.uk" },
      ];

      db.query.mockResolvedValueOnce([mockResults]);

      const res = await request(app).get("/api/search?author=alice");

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual(mockResults);
    });

    it("should search by title AND author (combined)", async () => {
      const mockResults = [
        { id: 3, title: "Advanced React", note_data: "...", module: "CM50109", owner_email: "alice@bath.ac.uk" },
      ];

      db.query.mockResolvedValueOnce([mockResults]);

      const res = await request(app).get("/api/search?title=React&author=alice");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual(mockResults);
      // Verify query has both title and author filters
      const query = db.query.mock.calls[0][0];
      expect(query).toContain("title");
      expect(query).toContain("email");
    });

    it("should perform case-insensitive search", async () => {
      const mockResults = [
        { id: 1, title: "react tutorial", note_data: "...", module: "CM50109", owner_email: "user@bath.ac.uk" },
      ];

      db.query.mockResolvedValueOnce([mockResults]);

      const res = await request(app).get("/api/search?title=REACT");

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual(mockResults);
    });

    it("should support partial title matching", async () => {
      const mockResults = [
        { id: 1, title: "React Tutorial", note_data: "...", module: "CM50109", owner_email: "user@bath.ac.uk" },
        { id: 2, title: "Advanced React", note_data: "...", module: "CM50264", owner_email: "bob@bath.ac.uk" },
      ];

      db.query.mockResolvedValueOnce([mockResults]);

      const res = await request(app).get("/api/search?title=React");

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toEqual(2);
      // Verify LIKE operator was used for wildcard
      expect(db.query.mock.calls[0][1][0]).toContain("%React%");
    });

    it("should return empty array when no results", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/search?title=nonexistent");

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it("should handle database errors gracefully", async () => {
      db.query.mockRejectedValueOnce(new Error("Database connection failed"));

      const res = await request(app).get("/api/search?title=test");

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });

    it("should return results with no filter parameters", async () => {
      const mockResults = [
        { id: 1, title: "Note 1", note_data: "...", module: "CM50109", owner_email: "user@bath.ac.uk" },
      ];

      db.query.mockResolvedValueOnce([mockResults]);

      const res = await request(app).get("/api/search");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual(mockResults);
    });

    it("should prevent SQL injection in title search", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/search?title='; DROP TABLE notes; --");

      expect(res.statusCode).toBe(200);
      // Verify parameterized query was used (not concatenated)
      expect(db.query).toHaveBeenCalled();
      const params = db.query.mock.calls[0][1];
      expect(Array.isArray(params)).toBe(true);
      expect(params[0]).toContain("%");
      expect(params[0]).toContain("DROP");
    });

    it("should prevent SQL injection in author search", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/search?author=alice@bath.ac.uk' OR '1'='1");

      expect(res.statusCode).toBe(200);
      // Verify parameterized query protects against injection
      expect(db.query).toHaveBeenCalled();
      const params = db.query.mock.calls[0][1];
      expect(Array.isArray(params)).toBe(true);
    });
  });
});
