const express = require("express");
const router = express.Router();
const db = require("../db");

// Leaderboard — must come before /notes/:id
router.get("/notes/leaderboard", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                u.email,
                u.name,
                COUNT(n.id)                        AS totalNotes,
                ROUND(COALESCE(AVG(n.rating_average), 0), 2) AS avgRating
            FROM user_data u
            INNER JOIN notes n ON n.email = u.email
            GROUP BY u.email, u.name
            ORDER BY avgRating DESC, totalNotes DESC
        `);
        res.status(200).json({ ok: true, data: rows });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Get all notes (for teacher)
router.get("/notes", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM notes ORDER BY id DESC");
        res.status(200).json({ ok: true, data: rows });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Specific segment routes before wildcard /:id
router.get("/notes/module/:module", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM notes WHERE module = ?", [req.params.module]);
        res.status(200).json({ ok: true, data: rows });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.get("/notes/email/:email", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM notes WHERE email = ?", [req.params.email]);
        res.status(200).json({ ok: true, data: rows });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Check if a specific user has rated a note
router.get("/notes/:id/rating/:email", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT rating FROM note_ratings WHERE note_id = ? AND rater_email = ?",
            [req.params.id, req.params.email]
        );
        res.status(200).json({ ok: true, rated: rows.length > 0, rating: rows[0]?.rating ?? null });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Submit a rating (one per user per note)
router.post("/notes/:id/rate", async (req, res) => {
    try {
        const { rater_email, rating } = req.body;
        const note_id = req.params.id;

        const [existing] = await db.query(
            "SELECT id FROM note_ratings WHERE note_id = ? AND rater_email = ?",
            [note_id, rater_email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ ok: false, error: "You have already rated this note." });
        }

        await db.query(
            "INSERT INTO note_ratings (note_id, rater_email, rating) VALUES (?, ?, ?)",
            [note_id, rater_email, rating]
        );

        // Recalculate average from all ratings
        const [stats] = await db.query(
            "SELECT AVG(rating) AS avg_rating, COUNT(*) AS total FROM note_ratings WHERE note_id = ?",
            [note_id]
        );
        const newAvg = Number(stats[0].avg_rating).toFixed(2);
        const newCount = stats[0].total;

        await db.query(
            "UPDATE notes SET rating_average = ?, number_ratings = ? WHERE id = ?",
            [newAvg, newCount, note_id]
        );

        res.status(200).json({ ok: true, newAverage: Number(newAvg), newCount });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.get("/notes/:id", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM notes WHERE id = ?", [req.params.id]);
        res.status(200).json({ ok: true, data: rows });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.post("/notes", async (req, res) => {
    try {
        const { email, verified, note_data, rating_average, number_ratings, module, note_title } = req.body;
        const [result] = await db.query(
            "INSERT INTO notes (email,verified,note_data,rating_average,number_ratings,module,note_title) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [email, verified, note_data, rating_average, number_ratings, module, note_title]
        );
        return res.status(201).json({ ok: true, message: "Note created", insertId: result.insertId });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.delete("/notes/:id", async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM notes WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, error: "Note not found" });
        }
        return res.status(200).json({ ok: true, message: "Note deleted" });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.put("/notes/:id", async (req, res) => {
    try {
        const { email, verified, note_data, rating_average, number_ratings, module, note_title } = req.body;
        const [result] = await db.query(
            "UPDATE notes SET email=?,verified=?,note_data=?,rating_average=?,number_ratings=?,module=?,note_title=? WHERE id=?",
            [email, verified, note_data, rating_average, number_ratings, module, note_title, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, error: "Note not found" });
        }
        return res.status(200).json({ ok: true, message: "Note updated" });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.put("/notes/verify/:id", async (req, res) => {
    try {
        const [result] = await db.query("UPDATE notes SET verified=1 WHERE id=?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ ok: false, error: "Note not found" });
        return res.status(200).json({ ok: true, message: "Note verified" });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.put("/notes/unverify/:id", async (req, res) => {
    try {
        const [result] = await db.query("UPDATE notes SET verified=0 WHERE id=?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ ok: false, error: "Note not found" });
        return res.status(200).json({ ok: true, message: "Note unverified" });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
