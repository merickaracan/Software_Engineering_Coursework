const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/notes/:id",async (req,res) =>{
    try{
        const [rows] = await db.query(
            "SELECT notes.*, user_data.email as owner_email FROM notes LEFT JOIN user_data ON notes.owner_id = user_data.id WHERE notes.id = ?",
            [req.params.id]
        );
        res.status(200).json({ ok: true, data: rows });
        }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
        }
});

router.get("/notes/module/:module",async (req,res) =>{
    try{
        const [rows] = await db.query(
            "SELECT notes.*, user_data.email as owner_email FROM notes LEFT JOIN user_data ON notes.owner_id = user_data.id WHERE notes.module = ?",
            [req.params.module]
        );
        res.status(200).json({ ok: true, data: rows });
        }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
        }
});

router.get("/notes/email/:email",async (req,res) =>{
    try{
        const [userRows] = await db.query("SELECT id FROM user_data WHERE email = ?",[req.params.email]);
        if (userRows.length === 0) {
            return res.status(404).json({ ok: false, error: "User not found" });
        }
        const owner_id = userRows[0].id;
        const [rows] = await db.query(
            "SELECT notes.*, user_data.email as owner_email FROM notes LEFT JOIN user_data ON notes.owner_id = user_data.id WHERE notes.owner_id = ?",
            [owner_id]
        );
        res.status(200).json({ ok: true, data: rows });
        }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
        }
});

router.post("/notes",async (req,res) =>{
    try{
        const {owner_email,title,note_data,module} = req.body;
        
        // Look up owner_id from email
        const [userRows] = await db.query("SELECT id FROM user_data WHERE email = ?",[owner_email]);
        if (userRows.length === 0) {
            return res.status(400).json({ ok: false, error: "User not found" });
        }
        const owner_id = userRows[0].id;
        
        const [result] = await db.query("INSERT INTO notes (owner_id, title, note_data, module) VALUES (?, ?, ?, ?)",[owner_id, title, note_data, module]);
        return res.status(201).json({
            ok: true,
            message: "Note created",
            insertId: result.insertId
        });
    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.delete("/notes/:id", async (req,res) =>{
    try{
        const [result] = await db.query("DELETE FROM notes WHERE id = ?",[req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({ ok: false, error: "Note not found" });
        }
        return res.status(200).json({ ok: true, message: "Note deleted" });

    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.put("/notes/:id", async (req,res) =>{
    try{
        const {title, note_data,module} = req.body;
        const [result] = await db.query("UPDATE notes SET title = ?, note_data = ?, module = ?, updated_at = datetime('now') WHERE id = ?",[title, note_data,module,req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({ ok: false, error: "Note not found" });
        }
        return res.status(200).json({ ok: true, message: "Note updated" });
    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.put("/notes/verify/:id", async (req,res) =>{
    try{
        const [result] = await db.query("UPDATE notes SET is_verified = ? WHERE id = ?",[1,req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({ ok: false, error: "Note not found" });
        }
        return res.status(200).json({ ok: true, message: "Note verified" });
    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.put("/notes/unverify/:id", async (req,res) =>{
    try{
        const [result] = await db.query("UPDATE notes SET is_verified = ? WHERE id = ?",[0,req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({ ok: false, error: "Note not found" });
        }
        return res.status(200).json({ ok: true, message: "Note unverified" });
    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;