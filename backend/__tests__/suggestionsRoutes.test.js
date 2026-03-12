const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../app");
const db = require("../database/db");

jest.mock("../database/db");

const JWT_SECRET = process.env.JWT_SECRET || "default";

const createToken = (email) => jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });

describe("Suggestions Routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches a suggestion by ID", async () => {
    const suggestion = { id: 1, note_id: 5, commenter_id: 10, suggestion_data: "Use more examples" };
    db.query.mockResolvedValueOnce([[suggestion]]);

    const res = await request(app).get("/api/suggestions/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, data: [suggestion] });
  });

  it("fetches suggestions by commenter", async () => {
    const rows = [{ id: 1, commenter_id: 10 }, { id: 2, commenter_id: 10 }];
    db.query.mockResolvedValueOnce([rows]);

    const res = await request(app).get("/api/suggestions/commenter/10");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, data: rows });
  });

  it("fetches suggestions by note", async () => {
    const rows = [{ id: 1, note_id: 5 }, { id: 2, note_id: 5 }];
    db.query.mockResolvedValueOnce([rows]);

    const res = await request(app).get("/api/suggestions/note/5");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, data: rows });
  });

  it("requires authentication to create a suggestion", async () => {
    const res = await request(app).post("/api/suggestions").send({ note_id: 5, suggestion_data: "Test" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("No token provided. Please log in.");
  });

  it("creates a suggestion when authenticated", async () => {
    const token = createToken("user@bath.ac.uk");
    db.query.mockResolvedValueOnce([{ insertId: 7 }]);

    const res = await request(app)
      .post("/api/suggestions")
      .set("Cookie", `token=${token}`)
      .send({
        note_id: 5,
        commenter_id: 10,
        suggestion_data: "Great note, expand section two.",
        note_owner_id: 3,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ ok: true, message: "Comment posted", insertId: 7 });
  });

  it("requires authentication to delete a suggestion", async () => {
    const res = await request(app).delete("/api/suggestions/1");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("No token provided. Please log in.");
  });

  it("returns 404 when deleting a missing suggestion", async () => {
    const token = createToken("user@bath.ac.uk");
    db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

    const res = await request(app)
      .delete("/api/suggestions/999")
      .set("Cookie", `token=${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ ok: false, error: "Comment not found" });
  });

  it("deletes a suggestion", async () => {
    const token = createToken("user@bath.ac.uk");
    db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .delete("/api/suggestions/1")
      .set("Cookie", `token=${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, message: "Comment deleted" });
  });
});
