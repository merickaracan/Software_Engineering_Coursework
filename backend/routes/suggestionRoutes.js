const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/suggestions/:id",async (req,res) =>{
    try{
        const [rows] = await db.query("SELECT * FROM Suggestions WHERE id = ?",[req.params.id]);
        res.status(200).json({ ok: true, data: rows });
        }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
        }
});

router.get("/suggestions/commenter/:id",async (req,res) =>{
    try{
        const [rows] = await db.query("SELECT * FROM Suggestions WHERE commenter_id = ?",[req.params.id]);
        res.status(200).json({ ok: true, data: rows });
        }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
        }
});

router.post("/suggestions",async (req,res) =>{
    try{
        const {commenter_id,suggestion_data,note_owner_id} = req.body;
        const [result] = await db.query("INSERT INTO Suggestions (commenter_id,suggestion_data,note_owner_id) VALUES (?, ?, ?)",[commenter_id,suggestion_data,note_owner_id]);
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
        const [result] = await db.query("DELETE FROM Suggestions WHERE id = ?",[req.params.id]);
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
        const {commenter_id,suggestion_data,note_owner_id} = req.body;
        const [result] = await db.query("UPDATE Suggestions SET commenter_id = ?, suggestion_data = ?, note_owner_id = ? WHERE id = ?",[commenter_id,suggestion_data,note_owner_id,req.params.id]);
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