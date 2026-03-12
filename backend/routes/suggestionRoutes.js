const express = require("express");
const router = express.Router();
const db = require("../database/db");
const requireAuth = require("../middleware/requireAuth");

router.get("/suggestions/note/:noteId", async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT
                s.*,
                u.name AS commenter_name,
                u.email AS commenter_email,
                u.profile_picture AS commenter_profile_picture,
                u.lecturer AS lecturer
            FROM Suggestions s
            LEFT JOIN user_data u ON u.rowid = s.commenter_id OR u.email = s.commenter_id
            WHERE s.note_id = ?
            ORDER BY s.id DESC
            `,
            [req.params.noteId]
        );
        res.status(200).json({ ok: true, data: rows });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.get("/suggestions/commenter/:id", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM Suggestions WHERE commenter_id = ?", [req.params.id]);
        res.status(200).json({ ok: true, data: rows });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.get("/suggestions/:id", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM Suggestions WHERE id = ?", [req.params.id]);
        res.status(200).json({ ok: true, data: rows });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.post("/suggestions", requireAuth, async (req, res) => {
    try {
        const { note_id, commenter_id, suggestion_data, note_owner_id } = req.body;
        const [result] = await db.query(
            "INSERT INTO Suggestions (note_id, commenter_id, suggestion_data, note_owner_id) VALUES (?, ?, ?, ?)",
            [note_id, commenter_id, suggestion_data, note_owner_id]
        );
        return res.status(201).json({ ok: true, message: "Comment posted", insertId: result.insertId });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.delete("/suggestions/:id", requireAuth, async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM Suggestions WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, error: "Comment not found" });
        }
        return res.status(200).json({ ok: true, message: "Comment deleted" });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
