const express = require("express");
const router = express.Router();
const db = require("../db");
const requireAuth = require("../middleware/requireAuth");

/**
 * GET /suggestions/:id
 * Retrieves a specific suggestion by ID
 * @param {number} id - Suggestion ID
 * @returns {Object} { ok: boolean, data: Suggestion[], message?: string }
 */
router.get("/suggestions/:id", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM suggestions WHERE id = ?", [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ ok: false, message: "Suggestion not found" });
        }
        res.status(200).json({ ok: true, data: rows, message: "Suggestion retrieved successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * GET /suggestions/commenter/:id
 * Retrieves all suggestions made by a specific user
 * @param {number} id - User ID (commenter)
 * @returns {Object} { ok: boolean, data: Suggestion[], message?: string }
 */
router.get("/suggestions/commenter/:id", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT suggestions.id, suggestions.note_id, suggestions.commenter_id, 
                    suggestions.suggestion_data, suggestions.created_at, 
                    user_data.name as commenter_name, user_data.email as commenter_email, 
                    user_data.is_lecturer, user_data.profile_picture as commenter_profile_picture 
             FROM suggestions 
             LEFT JOIN user_data ON suggestions.commenter_id = user_data.id 
             WHERE commenter_id = ?`,
            [req.params.id]
        );
        res.status(200).json({ ok: true, data: rows, message: "Suggestions retrieved successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * GET /suggestions/note/:note_id
 * Retrieves all suggestions for a specific note
 * @param {number} note_id - Note ID
 * @returns {Object} { ok: boolean, data: Suggestion[], message?: string }
 */
router.get("/suggestions/note/:note_id", async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT suggestions.id, suggestions.note_id, suggestions.commenter_id, 
                    suggestions.suggestion_data, suggestions.created_at, 
                    user_data.name as commenter_name, user_data.email as commenter_email, 
                    user_data.is_lecturer, user_data.profile_picture as commenter_profile_picture 
             FROM suggestions 
             LEFT JOIN user_data ON suggestions.commenter_id = user_data.id 
             WHERE suggestions.note_id = ?`,
            [req.params.note_id]
        );
        res.status(200).json({ ok: true, data: rows, message: "Note suggestions retrieved successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * POST /suggestions
 * Creates a new suggestion (requires authentication)
 * @param {Object} body - { note_id, suggestion_data }
 * @returns {Object} { ok: boolean, data?: { id: number }, message: string }
 */
router.post("/suggestions", requireAuth, async (req, res) => {
    try {
        const { note_id, suggestion_data } = req.body;

        // Validate required fields
        if (!note_id || !suggestion_data) {
            return res.status(400).json({
                ok: false,
                message: "Missing required fields: note_id, suggestion_data"
            });
        }

        // Get commenter ID from authenticated user
        const [userRows] = await db.query("SELECT id FROM user_data WHERE email = ?", [req.user.email]);
        if (userRows.length === 0) {
            return res.status(400).json({ ok: false, message: "User not found" });
        }
        const commenter_id = userRows[0].id;

        const [result] = await db.query(
            "INSERT INTO suggestions (note_id, commenter_id, suggestion_data) VALUES (?, ?, ?)",
            [note_id, commenter_id, suggestion_data]
        );

        res.status(201).json({
            ok: true,
            data: { id: result.insertId },
            message: "Suggestion created successfully"
        });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * DELETE /suggestions/:id
 * Deletes a suggestion (requires authentication and ownership)
 * @param {number} id - Suggestion ID
 * @returns {Object} { ok: boolean, message: string }
 */
router.delete("/suggestions/:id", requireAuth, async (req, res) => {
    try {
        // Verify ownership before deleting
        const [suggestionRows] = await db.query(
            `SELECT suggestions.commenter_id, user_data.email 
             FROM suggestions 
             JOIN user_data ON suggestions.commenter_id = user_data.id 
             WHERE suggestions.id = ?`,
            [req.params.id]
        );

        if (suggestionRows.length === 0) {
            return res.status(404).json({ ok: false, message: "Suggestion not found" });
        }

        if (suggestionRows[0].email !== req.user.email) {
            return res.status(403).json({ ok: false, message: "Unauthorized - can only delete own suggestions" });
        }

        const [result] = await db.query("DELETE FROM suggestions WHERE id = ?", [req.params.id]);
        res.status(200).json({ ok: true, message: "Suggestion deleted successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * PUT /suggestions/:id
 * Updates a suggestion (requires authentication and ownership)
 * @param {number} id - Suggestion ID
 * @param {Object} body - { suggestion_data }
 * @returns {Object} { ok: boolean, message: string }
 */
router.put("/suggestions/:id", requireAuth, async (req, res) => {
    try {
        const { suggestion_data } = req.body;

        // Validate required fields
        if (!suggestion_data || suggestion_data.trim() === "") {
            return res.status(400).json({
                ok: false,
                message: "Suggestion data cannot be empty"
            });
        }

        // Verify ownership before updating
        const [suggestionRows] = await db.query(
            `SELECT suggestions.commenter_id, user_data.email 
             FROM suggestions 
             JOIN user_data ON suggestions.commenter_id = user_data.id 
             WHERE suggestions.id = ?`,
            [req.params.id]
        );

        if (suggestionRows.length === 0) {
            return res.status(404).json({ ok: false, message: "Suggestion not found" });
        }

        if (suggestionRows[0].email !== req.user.email) {
            return res.status(403).json({ ok: false, message: "Unauthorized - can only update own suggestions" });
        }

        const [result] = await db.query(
            "UPDATE suggestions SET suggestion_data = ? WHERE id = ?",
            [suggestion_data, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, message: "Suggestion not found" });
        }

        res.status(200).json({ ok: true, message: "Suggestion updated successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

module.exports = router;