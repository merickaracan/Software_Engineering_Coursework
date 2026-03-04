const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/suggestions/:id",async (req,res) =>{
    try{
        const [rows] = await db.query("SELECT * FROM suggestions WHERE id = ?",[req.params.id]);
        res.status(200).json({ ok: true, data: rows });
        }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
        }
});

router.get("/suggestions/commenter/:id",async (req,res) =>{
    try{
    const [rows] = await db.query("SELECT suggestions.id, suggestions.note_id, suggestions.commenter_id, suggestions.suggestion_data, suggestions.created_at, user_data.name as commenter_name, user_data.email as commenter_email, user_data.is_lecturer, user_data.profile_picture as commenter_profile_picture FROM suggestions LEFT JOIN user_data ON suggestions.commenter_id = user_data.id WHERE commenter_id = ?",[req.params.id]);
        res.status(200).json({ ok: true, data: rows });
        }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
        }
});

router.get("/suggestions/note/:note_id",async (req,res) =>{
    try{
    const [rows] = await db.query("SELECT suggestions.id, suggestions.note_id, suggestions.commenter_id, suggestions.suggestion_data, suggestions.created_at, user_data.name as commenter_name, user_data.email as commenter_email, user_data.is_lecturer, user_data.profile_picture as commenter_profile_picture FROM suggestions LEFT JOIN user_data ON suggestions.commenter_id = user_data.id WHERE suggestions.note_id = ?",[req.params.note_id]);
        res.status(200).json({ ok: true, data: rows });
        }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
        }
});

router.post("/suggestions",async (req,res) =>{
    try{
        const {note_id,commenter_id,suggestion_data} = req.body;
        const [result] = await db.query("INSERT INTO suggestions (note_id,commenter_id,suggestion_data) VALUES (?, ?, ?)",[note_id,commenter_id,suggestion_data]);
        return res.status(201).json({
            ok: true,
            message: "Suggestion created",
            insertId: result.insertId
        });
    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.delete("/suggestions/:id", async (req,res) =>{
    try{
        const [result] = await db.query("DELETE FROM suggestions WHERE id = ?",[req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({ ok: false, error: "Suggestion not found" });
        }
        return res.status(200).json({ ok: true, message: "Suggestion deleted" });

    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.put("/suggestions/:id", async (req,res) =>{
    try{
        const {suggestion_data} = req.body;
        const [result] = await db.query("UPDATE suggestions SET suggestion_data = ? WHERE id = ?",[suggestion_data,req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({ ok: false, error: "Suggestion not found" });
        }
        return res.status(200).json({ ok: true, message: "Suggestion updated" });
    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;