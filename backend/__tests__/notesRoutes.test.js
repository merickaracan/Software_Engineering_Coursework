const request = require("supertest");
const app = require("../app");
const db = require("../db");

// Mock database to avoid real DB calls in tests
jest.mock("../db");

const makeEmail = (label = "user") =>
  `notes.${label}.${Date.now()}.${Math.floor(Math.random() * 10000)}@bath.ac.uk`;

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
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM notes WHERE id = ?", [noteId]);
    });

    it("should return empty array if note not found", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/notes/999");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual([]);
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
        { id: 1, owner_id: 1, title: "Note 1", module, note_data: "Note 1", is_verified: 1 },
        { id: 2, owner_id: 2, title: "Note 2", module, note_data: "Note 2", is_verified: 0 },
      ];

      db.query.mockResolvedValueOnce([mockNotes]);

      const res = await request(app).get(`/api/notes/module/${module}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual(mockNotes);
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM notes WHERE module = ?", [module]);
    });

    it("should return empty array if no notes for module", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/notes/module/INVALID");

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("GET /api/notes/email/:email", () => {
    it("should fetch all notes by owner email", async () => {
      const email = "user@bath.ac.uk";
      const mockNotes = [
        { id: 1, owner_id: 1, title: "Note 1", module: "CM50109", note_data: "Note 1", is_verified: 1 },
        { id: 2, owner_id: 1, title: "Note 2", module: "CM50264", note_data: "Note 2", is_verified: 0 },
      ];

      // Mock user lookup
      db.query.mockResolvedValueOnce([[{ id: 1 }]]);
      // Mock notes fetch
      db.query.mockResolvedValueOnce([mockNotes]);

      const res = await request(app).get(`/api/notes/email/${email}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual(mockNotes);
    });

    it("should return 404 if user not found", async () => {
      const email = "nonexistent@bath.ac.uk";
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get(`/api/notes/email/${email}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toBe("User not found");
    });
  });

  describe("POST /api/notes", () => {
    it("should create a new note", async () => {
      const noteData = {
        owner_email: "user@bath.ac.uk",
        title: "New Note Title",
        note_data: "New note content",
        module: "CM50109",
      };

      // Mock user lookup
      db.query.mockResolvedValueOnce([[{ id: 1 }]]);
      // Mock note creation
      db.query.mockResolvedValueOnce([{ insertId: 1, lastID: 1 }]);

      const res = await request(app).post("/api/notes").send(noteData);

      expect(res.statusCode).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.insertId).toBe(1);
    });

    it("should return 400 if user not found", async () => {
      const noteData = {
        owner_email: "nonexistent@bath.ac.uk",
        title: "Test Note",
        note_data: "New note content",
        module: "CM50109",
      };

      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).post("/api/notes").send(noteData);

      expect(res.statusCode).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toBe("User not found");
    });

    it("should handle database errors", async () => {
      const noteData = {
        owner_email: "user@bath.ac.uk",
        title: "Error Test Note",
        note_data: "New note content",
        module: "CM50109",
      };

      // Mock user lookup success
      db.query.mockResolvedValueOnce([[{ id: 1 }]]);
      // Mock insert failure
      db.query.mockRejectedValueOnce(new Error("DB insert failed"));

      const res = await request(app).post("/api/notes").send(noteData);

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("PUT /api/notes/:id", () => {
    it("should update a note", async () => {
      const noteId = 1;
      const updateData = {
        title: "Updated Note Title",
        note_data: "Updated content",
        module: "CM50109",
      };

      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).put(`/api/notes/${noteId}`).send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Note updated");
    });

    it("should return 404 if note not found", async () => {
      const updateData = {
        title: "Updated Title",
        note_data: "Updated content",
        module: "CM50109",
      };

      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).put("/api/notes/999").send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toBe("Note not found");
    });
  });

  describe("PUT /api/notes/verify/:id", () => {
    it("should verify a note", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).put("/api/notes/verify/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Note verified");
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE notes SET is_verified = ? WHERE id = ?",
        [1, "1"]
      );
    });

    it("should return 404 if note not found", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).put("/api/notes/verify/999");

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Note not found");
    });
  });

  describe("PUT /api/notes/unverify/:id", () => {
    it("should unverify a note", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).put("/api/notes/unverify/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Note unverified");
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE notes SET is_verified = ? WHERE id = ?",
        [0, "1"]
      );
    });
  });

  describe("DELETE /api/notes/:id", () => {
    it("should delete a note", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).delete("/api/notes/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Note deleted");
    });

    it("should return 404 if note not found", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).delete("/api/notes/999");

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Note not found");
    });
  });
});
