const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/getBySuggestionID/:id",async (req,res) =>{
    try{
        const suggestion = await db.query("SELECT * FROM Suggestions WHERE id = ?",[req.params.id]);
        res.json(suggestion);
        }
    catch (err) {
        res.status(500).json({ error: err.message });
        }
});

router.get("/getByCommenterID/:id",async (req,res) =>{
    try{
        const suggestion = await db.query("SELECT * FROM Suggestions WHERE commenter_id = ?",[req.params.id]);
        res.json(suggestion);
        }
    catch (err) {
        res.status(500).json({ error: err.message });
        }
});

router.post("/addSuggestion",async (req,res) =>{
    try{
        const {commenter_id,suggestion_data,note_owner_id} = req.body;
        const [result] = await db.query("INSERT INTO Suggestions (commenter_id,suggestion_data,note_owner_id) VALUES (?, ?, ?)",[commenter_id,suggestion_data,note_owner_id]);
        return true;
    }
    catch (err){
        res.status(500).json({ error: err.message });
    }
});

router.delete("/deleteSuggestion/:id", async (req,res) =>{
    try{
        const [result] = await db.query("DELETE FROM Suggestions WHERE id = ?",[req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({error: "Suggestion not found"});
        }
        return true;

    }
    catch (err){
        res.status(500).json({error: err.message});
    }
});

router.put("/updateSuggestion/:email", async (req,res) =>{
    try{
        const {commenter_id,suggestion_data,note_owner_id} = req.body;
        const [result] = await db.query("UPDATE Suggestions SET commenter_id = ?, suggestion_data = ?, note_owner_id = ? WHERE id = ?",[commenter_id,suggestion_data,note_owner_id,req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({error: "Suggestion not found"});
        }
        return true;
    }
    catch (err){
        res.status(500).json({error: err.message});
    }
});


module.exports = router;