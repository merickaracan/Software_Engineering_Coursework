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
        email: "user@bath.ac.uk",
        module: "CM50109",
        note_data: "Test note content",
        verified: 1,
        rating_average: 4.5,
        number_ratings: 10,
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
        { id: 1, email: "user1@bath.ac.uk", module, note_data: "Note 1" },
        { id: 2, email: "user2@bath.ac.uk", module, note_data: "Note 2" },
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
    it("should fetch all notes by email", async () => {
      const email = "user@bath.ac.uk";
      const mockNotes = [
        { id: 1, email, module: "CM50109", note_data: "Note 1" },
        { id: 2, email, module: "CM50264", note_data: "Note 2" },
      ];

      db.query.mockResolvedValueOnce([mockNotes]);

      const res = await request(app).get(`/api/notes/email/${email}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toEqual(mockNotes);
    });
  });

  describe("POST /api/notes", () => {
    it("should create a new note", async () => {
      const noteData = {
        email: "user@bath.ac.uk",
        verified: 0,
        note_data: "New note content",
        rating_average: 0,
        number_ratings: 0,
        module: "CM50109",
        note_title: "My First Note",
      };

      db.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app).post("/api/notes").send(noteData);

      expect(res.statusCode).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.insertId).toBe(1);
    });

    it("should handle missing fields gracefully", async () => {
      const incompleteNote = {
        email: "user@bath.ac.uk",
        note_data: "No module specified",
      };

      db.query.mockResolvedValueOnce([{ insertId: 2 }]);

      const res = await request(app).post("/api/notes").send(incompleteNote);

      expect(res.statusCode).toBe(201);
      expect(res.body.ok).toBe(true);
    });

    it("should handle database errors", async () => {
      db.query.mockRejectedValueOnce(new Error("DB insert failed"));

      const res = await request(app).post("/api/notes").send({});

      expect(res.statusCode).toBe(500);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("PUT /api/notes/:id", () => {
    it("should update a note", async () => {
      const noteId = 1;
      const updateData = {
        email: "user@bath.ac.uk",
        verified: 1,
        note_data: "Updated content",
        rating_average: 4.2,
        number_ratings: 15,
        module: "CM50109",
        note_title: "Updated Title",
      };

      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).put(`/api/notes/${noteId}`).send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Note updated");
    });

    it("should return 404 if note not found", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).put("/api/notes/999").send({});

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
        "UPDATE notes SET verified = ? WHERE id = ?",
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
        "UPDATE notes SET verified = ? WHERE id = ?",
        [0, "1"]
      );
    });
  });

  describe("PUT /api/notes/rating", () => {
    it("should update note rating", async () => {
      const ratingData = {
        id: 1,
        average: 4.5,
        number: 20,
      };

      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).put("/api/notes/rating").send(ratingData);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Note updated");
    });

    it("should return 404 if note not found", async () => {
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app).put("/api/notes/rating").send({
        id: 999,
        average: 4.0,
        number: 10,
      });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Note not found");
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
