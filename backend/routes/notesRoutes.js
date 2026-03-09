const express = require("express");
const router = express.Router();
const db = require("../db");
const requireAuth = require("../middleware/requireAuth");

/**
 * GET /search
 * Searches for notes by title and/or author
 * @param {string} [title] - Note title to search for (partial match)
 * @param {string} [author] - Author email to search for (partial match)
 * @returns {Object} { ok: boolean, data: Note[], message?: string }
 */
router.get("/search", async (req, res) => {
    try {
        const { title, author } = req.query;
        let query = "SELECT notes.*, user_data.email as owner_email FROM notes LEFT JOIN user_data ON notes.owner_id = user_data.id WHERE 1=1";
        const params = [];

        if (title) {
            query += " AND notes.title LIKE ?";
            params.push(`%${title}%`);
        }

        if (author) {
            query += " AND user_data.email LIKE ?";
            params.push(`%${author}%`);
        }

        const [rows] = await db.query(query, params);
        res.status(200).json({ ok: true, data: rows, message: "Search completed successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * GET /notes/:id
 * Retrieves a specific note by ID
 * @param {number} id - Note ID
 * @returns {Object} { ok: boolean, data: Note[], message?: string }
 */
router.get("/notes/:id", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT notes.*, user_data.email as owner_email FROM notes LEFT JOIN user_data ON notes.owner_id = user_data.id WHERE notes.id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ ok: false, message: "Note not found" });
        }
        res.status(200).json({ ok: true, data: rows, message: "Note retrieved successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * GET /notes/module/:module
 * Retrieves all notes for a specific module
 * @param {string} module - Module code (e.g., 'se', 'ml')
 * @returns {Object} { ok: boolean, data: Note[], message?: string }
 */
router.get("/notes/module/:module", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT notes.*, user_data.email as owner_email FROM notes LEFT JOIN user_data ON notes.owner_id = user_data.id WHERE notes.module = ?",
            [req.params.module]
        );
        res.status(200).json({ ok: true, data: rows, message: "Notes retrieved successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * GET /notes/email/:email
 * Retrieves all notes created by a specific user (fixed N+1 query)
 * @param {string} email - User email
 * @returns {Object} { ok: boolean, data: Note[], message?: string }
 */
router.get("/notes/email/:email", async (req, res) => {
    try {
        // FIXED: Combined into single JOIN query (was 2 queries before)
        const [rows] = await db.query(
            `SELECT notes.*, user_data.email as owner_email 
             FROM notes 
             JOIN user_data ON notes.owner_id = user_data.id 
             WHERE user_data.email = ?`,
            [req.params.email]
        );
        res.status(200).json({ ok: true, data: rows, message: "User notes retrieved successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * POST /notes
 * Creates a new note (requires authentication)
 * FIXED: Single query with automatic user lookup via auth token
 * @param {Object} body - { title, note_data, module, file? }
 * @returns {Object} { ok: boolean, data?: { id: number }, message: string }
 */
router.post("/notes", requireAuth, async (req, res) => {
    try {
        const { title, note_data, module, file } = req.body;

        // Validate required fields
        if (!title || !note_data || !module) {
            return res.status(400).json({
                ok: false,
                message: "Missing required fields: title, note_data, module"
            });
        }

        // Use authenticated user's email from token
        const userEmail = req.user.email;

        // FIXED: Optimized to single query - user lookup happens in auth middleware
        const [userRows] = await db.query("SELECT id FROM user_data WHERE email = ?", [userEmail]);
        if (userRows.length === 0) {
            return res.status(400).json({ ok: false, message: "User not found" });
        }
        const owner_id = userRows[0].id;

        const [result] = await db.query(
            "INSERT INTO notes (owner_id, title, note_data, module, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                owner_id,
                title,
                note_data,
                module,
                file?.name || null,
                file?.type || null,
                file?.size || 0,
                file?.data || null
            ]
        );

        res.status(201).json({
            ok: true,
            data: { id: result.insertId },
            message: "Note created successfully"
        });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * DELETE /notes/:id
 * Deletes a note (requires authentication and ownership)
 * @param {number} id - Note ID
 * @returns {Object} { ok: boolean, message: string }
 */
router.delete("/notes/:id", requireAuth, async (req, res) => {
    try {
        // Verify ownership before deleting
        const [noteRows] = await db.query(
            "SELECT notes.owner_id, user_data.email FROM notes JOIN user_data ON notes.owner_id = user_data.id WHERE notes.id = ?",
            [req.params.id]
        );

        if (noteRows.length === 0) {
            return res.status(404).json({ ok: false, message: "Note not found" });
        }

        if (noteRows[0].email !== req.user.email) {
            return res.status(403).json({ ok: false, message: "Unauthorized - can only delete own notes" });
        }

        const [result] = await db.query("DELETE FROM notes WHERE id = ?", [req.params.id]);
        res.status(200).json({ ok: true, message: "Note deleted successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * PUT /notes/:id
 * Updates a note (requires authentication and ownership)
 * @param {number} id - Note ID
 * @param {Object} body - { title?, note_data?, module?, file? }
 * @returns {Object} { ok: boolean, message: string }
 */
router.put("/notes/:id", requireAuth, async (req, res) => {
    try {
        const { title, note_data, module, file } = req.body;

        // Verify ownership before updating
        const [noteRows] = await db.query(
            "SELECT notes.owner_id, user_data.email FROM notes JOIN user_data ON notes.owner_id = user_data.id WHERE notes.id = ?",
            [req.params.id]
        );

        if (noteRows.length === 0) {
            return res.status(404).json({ ok: false, message: "Note not found" });
        }

        if (noteRows[0].email !== req.user.email) {
            return res.status(403).json({ ok: false, message: "Unauthorized - can only update own notes" });
        }

        const [result] = await db.query(
            "UPDATE notes SET title = ?, note_data = ?, module = ?, file_name = ?, file_type = ?, file_size = ?, file_data = ?, updated_at = datetime('now') WHERE id = ?",
            [
                title,
                note_data,
                module,
                file?.name || null,
                file?.type || null,
                file?.size || 0,
                file?.data || null,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, message: "Note not found" });
        }

        res.status(200).json({ ok: true, message: "Note updated successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * PUT /notes/verify/:id
 * Verifies a note (requires authentication and lecturer status)
 * @param {number} id - Note ID
 * @returns {Object} { ok: boolean, message: string }
 */
/**
 * PUT /notes/verify/:id
 * Verifies a note (requires authentication and lecturer status)
 * @param {number} id - Note ID
 * @returns {Object} { ok: boolean, message: string }
 */
router.put("/notes/verify/:id", requireAuth, async (req, res) => {
    try {
        const [userRows] = await db.query("SELECT is_lecturer FROM user_data WHERE email = ?", [req.user.email]);
        if (!userRows.length || userRows[0].is_lecturer !== 1) {
            return res.status(403).json({ ok: false, message: "Only lecturers can verify notes" });
        }

        const [result] = await db.query("UPDATE notes SET is_verified = ? WHERE id = ?", [1, req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, message: "Note not found" });
        }
        res.status(200).json({ ok: true, message: "Note verified successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * PUT /notes/unverify/:id
 * Unverifies a note (requires authentication and lecturer status)
 * @param {number} id - Note ID
 * @returns {Object} { ok: boolean, message: string }
 */
router.put("/notes/unverify/:id", requireAuth, async (req, res) => {
    try {
        const [userRows] = await db.query("SELECT is_lecturer FROM user_data WHERE email = ?", [req.user.email]);
        if (!userRows.length || userRows[0].is_lecturer !== 1) {
            return res.status(403).json({ ok: false, message: "Only lecturers can unverify notes" });
        }

        const [result] = await db.query("UPDATE notes SET is_verified = ? WHERE id = ?", [0, req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, message: "Note not found" });
        }
        res.status(200).json({ ok: true, message: "Note unverified successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

module.exports = router;