const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const db = require("../database/db");

jest.mock("../database/db");

const JWT_SECRET = process.env.JWT_SECRET || "default";

const createToken = (email) => jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });

describe("Notes Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/notes/leaderboard", () => {
    it("returns leaderboard rows", async () => {
      const rows = [{ email: "user@bath.ac.uk", name: "User", totalNotes: 3, avgRating: 4.5 }];
      db.query.mockResolvedValueOnce([rows]);

      const res = await request(app).get("/api/notes/leaderboard");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, data: rows });
    });
  });

  describe("GET /api/notes/:id", () => {
    it("fetches a note by ID", async () => {
      const note = {
        id: 1,
        email: "user@bath.ac.uk",
        verified: 1,
        note_data: "Test note content",
        rating_average: 4.5,
        number_ratings: 2,
        module: "CM50109",
        note_title: "Test Note Title",
        owner_profile_picture: null,
      };
      db.query.mockResolvedValueOnce([[note]]);

      const res = await request(app).get("/api/notes/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data[0]).toEqual(note);
    });

    it("returns an empty list if note does not exist", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/notes/999");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, data: [] });
    });
  });

  describe("GET /api/notes/module/:module", () => {
    it("fetches all notes for a module", async () => {
      const rows = [{ id: 1, module: "CM50109" }, { id: 2, module: "CM50109" }];
      db.query.mockResolvedValueOnce([rows]);

      const res = await request(app).get("/api/notes/module/CM50109");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, data: rows });
    });
  });

  describe("GET /api/notes/email/:email", () => {
    it("fetches all notes by email", async () => {
      const email = "user@bath.ac.uk";
      const rows = [{ id: 1, email }, { id: 2, email }];
      db.query.mockResolvedValueOnce([rows]);

      const res = await request(app).get(`/api/notes/email/${email}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, data: rows });
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM notes WHERE email = ?", [email]);
    });
  });

  describe("GET /api/search", () => {
    it("searches notes by title and author", async () => {
      const rows = [{ id: 1, owner_email: "alice@bath.ac.uk", title: "React", module: "CM50109" }];
      db.query.mockResolvedValueOnce([rows]);

      const res = await request(app).get("/api/search?title=React&author=alice");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, data: rows });
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining("note_title LIKE ?"), ["%React%", "%alice%"]);
    });
  });

  describe("GET /api/notes/:id/rating/:email", () => {
    it("returns rated false when no rating exists", async () => {
      db.query.mockResolvedValueOnce([[]]);

      const res = await request(app).get("/api/notes/1/rating/user@bath.ac.uk");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, rated: false, rating: null });
    });

    it("returns existing rating details", async () => {
      db.query.mockResolvedValueOnce([[{ rating: 4 }]]);

      const res = await request(app).get("/api/notes/1/rating/user@bath.ac.uk");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, rated: true, rating: 4 });
    });
  });

  describe("POST /api/notes/:id/rate", () => {
    it("requires authentication", async () => {
      const res = await request(app).post("/api/notes/1/rate").send({ rater_email: "user@bath.ac.uk", rating: 5 });

      expect(res.statusCode).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("No token provided. Please log in.");
    });

    it("rejects duplicate ratings", async () => {
      const token = createToken("user@bath.ac.uk");
      db.query.mockResolvedValueOnce([[{ id: 1 }]]);

      const res = await request(app)
        .post("/api/notes/1/rate")
        .set("Cookie", `token=${token}`)
        .send({ rater_email: "user@bath.ac.uk", rating: 5 });

      expect(res.statusCode).toBe(409);
      expect(res.body).toEqual({ ok: false, error: "You have already rated this note." });
    });

    it("creates a rating and recalculates stats", async () => {
      const token = createToken("user@bath.ac.uk");
      db.query
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 1 }])
        .mockResolvedValueOnce([[{ avg_rating: 4.5, total: 2 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .post("/api/notes/1/rate")
        .set("Cookie", `token=${token}`)
        .send({ rater_email: "user@bath.ac.uk", rating: 5 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, newAverage: 4.5, newCount: 2 });
    });
  });

  describe("POST /api/notes", () => {
    it("requires authentication", async () => {
      const res = await request(app).post("/api/notes").send({});

      expect(res.statusCode).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("No token provided. Please log in.");
    });

    it("creates a note when authenticated", async () => {
      const token = createToken("user@bath.ac.uk");
      db.query.mockResolvedValueOnce([{ insertId: 5 }]);

      const res = await request(app)
        .post("/api/notes")
        .set("Cookie", `token=${token}`)
        .send({
          email: "user@bath.ac.uk",
          verified: 0,
          note_data: "New note content",
          rating_average: 0,
          number_ratings: 0,
          module: "CM50109",
          note_title: "New Note Title",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ ok: true, message: "Note created", insertId: 5 });
    });
  });

  describe("DELETE /api/notes/:id", () => {
    it("requires authentication", async () => {
      const res = await request(app).delete("/api/notes/1");

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("No token provided. Please log in.");
    });

    it("returns 404 if note was not deleted", async () => {
      const token = createToken("user@bath.ac.uk");
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app)
        .delete("/api/notes/999")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ ok: false, error: "Note not found" });
    });

    it("deletes a note", async () => {
      const token = createToken("user@bath.ac.uk");
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .delete("/api/notes/5")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, message: "Note deleted" });
    });
  });

  describe("PUT /api/notes/:id", () => {
    it("updates a note", async () => {
      const token = createToken("user@bath.ac.uk");
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put("/api/notes/5")
        .set("Cookie", `token=${token}`)
        .send({
          email: "user@bath.ac.uk",
          verified: 1,
          note_data: "Updated content",
          rating_average: 4.5,
          number_ratings: 2,
          module: "CM50264",
          note_title: "Updated Title",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, message: "Note updated" });
    });

    it("returns 404 when note does not exist", async () => {
      const token = createToken("user@bath.ac.uk");
      db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const res = await request(app)
        .put("/api/notes/999")
        .set("Cookie", `token=${token}`)
        .send({});

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ ok: false, error: "Note not found" });
    });
  });

  describe("PUT verification routes", () => {
    it("verifies a note", async () => {
      const token = createToken("user@bath.ac.uk");
      db.query.mockResolvedValueOnce([[{ lecturer: 1 }]]);
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put("/api/notes/verify/5")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, message: "Note verified" });
    });

    it("unverifies a note", async () => {
      const token = createToken("user@bath.ac.uk");
      db.query.mockResolvedValueOnce([[{ lecturer: 1 }]]);
      db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app)
        .put("/api/notes/unverify/5")
        .set("Cookie", `token=${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ ok: true, message: "Note unverified" });
    });
  });
});
