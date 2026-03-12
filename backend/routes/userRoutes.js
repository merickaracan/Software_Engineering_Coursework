const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getUserByEmail, getUserPublic, updateUserProfile, deleteUser } = require("../services/userService");
const db = require("../database/db");

router.get("/users/id/:id", async (req, res) => {
    try{
        const [rows] = await db.query("SELECT rowid AS id, email, name, lecturer, points, profile_picture FROM user_data WHERE rowid = ?", [req.params.id]);
        res.status(200).json({ ok: true, data: rows });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.get("/users/:email", async (req, res) => {
    try{
        const [rows] = await db.query("SELECT * FROM user_data WHERE email = ?",[req.params.email]);
        res.status(200).json({ ok: true, data: rows });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.post("/users",async (req,res) =>{
    try{
        const {email, name, passkey, lecturer, points, profile_picture} = req.body;
        const [result] = await db.query("INSERT INTO user_data (email, name, passkey, lecturer, points, profile_picture) VALUES (?, ?, ?, ?, ?, ?)",[email, name, passkey, lecturer, points, profile_picture || null]);
        return res.status(201).json({
            ok: true,
            message: "User created",
            insertId: result.insertId || null
        });
    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});

/**
 * PUT /users/:email/profile-picture
 * Updates a user's profile picture (requires authentication and ownership)
 * @param {string} email - User email
 * @param {Object} body - { profile_picture: string }
 * @returns {Object} { ok: boolean, message: string }
 */
router.put("/users/:email/profile-picture", requireAuth, async (req, res) => {
    try {
        // Verify requesting user owns this profile
        if (req.user.email !== req.params.email) {
            return res.status(403).json({ ok: false, message: "Unauthorized - can only update own profile" });
        }

        const { profile_picture } = req.body;
        const result = await updateUserProfile(req.params.email, { profile_picture });

        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, message: "User not found" });
        }

        res.status(200).json({ ok: true, message: "Profile picture updated successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * PUT /users/:email
 * Updates user information (requires authentication and ownership)
 * Only allows updating name and profile_picture
 * @param {string} email - User email
 * @param {Object} body - { name?: string, profile_picture?: string }
 * @returns {Object} { ok: boolean, message: string }
 */
router.put("/users/:email", requireAuth, async (req, res) => {
    try {
        // Verify requesting user owns this profile
        if (req.user.email !== req.params.email) {
            return res.status(403).json({ ok: false, message: "Unauthorized - can only update own profile" });
        }

        const { name, profile_picture } = req.body;
        const updates = {};

        if (name !== undefined) {
            if (!name || name.length < 2) {
                return res.status(400).json({ ok: false, message: "Name must be at least 2 characters" });
            }
            updates.name = name;
        }

        if (profile_picture !== undefined) {
            updates.profile_picture = profile_picture;
        }

        const result = await updateUserProfile(req.params.email, updates);

        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, message: "User not found" });
        }

        res.status(200).json({ ok: true, message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

/**
 * DELETE /users/:email
 * Deletes a user account (requires authentication and ownership)
 * @param {string} email - User email
 * @returns {Object} { ok: boolean, message: string }
 */
router.delete("/users/:email", requireAuth, async (req, res) => {
    try {
        // Verify requesting user owns this account
        if (req.user.email !== req.params.email) {
            return res.status(403).json({ ok: false, message: "Unauthorized - can only delete own account" });
        }

        const result = await deleteUser(req.params.email);

        if (result.affectedRows === 0) {
            return res.status(404).json({ ok: false, message: "User not found" });
        }

        res.status(200).json({ ok: true, message: "User account deleted successfully" });
    } catch (err) {
        res.status(500).json({ ok: false, message: err.message });
    }
});

module.exports = router;