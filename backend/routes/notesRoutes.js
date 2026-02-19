const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/getByNoteID/:id",async (req,res) =>{
    try{
        const note = await db.query("SELECT * FROM notes WHERE id = ?",[req.params.id]);
        res.json(note);
        }
    catch (err) {
        res.status(500).json({ error: err.message });
        }
});

router.get("/getByNoteModule/:module",async (req,res) =>{
    try{
        const note = await db.query("SELECT * FROM notes WHERE module = ?",[req.params.module]);
        res.json(note);
        }
    catch (err) {
        res.status(500).json({ error: err.message });
        }
});

router.get("/getByNoteEmail/:email",async (req,res) =>{
    try{
        const note = await db.query("SELECT * FROM notes WHERE email = ?",[req.params.email]);
        res.json(note);
        }
    catch (err) {
        res.status(500).json({ error: err.message });
        }
});

router.post("/addNote",async (req,res) =>{
    try{
        const {email,verified,note_data,rating_average,number_ratings,module} = req.body;
        const [result] = await db.query("INSERT INTO notes (email,verified,note_data,rating_average,number_ratings,module) VALUES (?, ?, ?, ?, ?, ?)",[email,verified,note_data,rating_average,number_ratings,module]);
        return true;
    }
    catch (err){
        res.status(500).json({ error: err.message });
    }
});

router.delete("/deleteNote/:id", async (req,res) =>{
    try{
        const [result] = await db.query("DELETE FROM notes WHERE id = ?",[req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({error: "Note not found"});
        }
        return true;

    }
    catch (err){
        res.status(500).json({error: err.message});
    }
});

router.put("/updateNote/:id", async (req,res) =>{
    try{
        const {email,verified,note_data,rating_average,number_ratings,module} = req.body;
        const [result] = await db.query("UPDATE notes SET email = ?,verified = ?,note_data = ?,rating_average = ?,number_ratings = ?,module = ?  WHERE id = ?",[email,verified,note_data,rating_average,number_ratings,module,req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({error: "Note not found"});
        }
        return true;
    }
    catch (err){
        res.status(500).json({error: err.message});
    }
});

router.put("/verifyNote/:id", async (req,res) =>{
    try{
        const [result] = await db.query("UPDATE notes SET verified = ? WHERE id = ?",[1,req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({error: "Note not found"});
        }
        return true;
    }
    catch (err){
        res.status(500).json({error: err.message});
    }
});

router.put("/unverifyNote/:id", async (req,res) =>{
    try{
        const [result] = await db.query("UPDATE notes SET verified = ? WHERE id = ?",[0,req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({error: "Note not found"});
        }
        return true;
    }
    catch (err){
        res.status(500).json({error: err.message});
    }
});

router.put("/changeNoteRating/:id/:average/:number", async (req,res) =>{
    try{
        const [result] = await db.query("UPDATE notes SET rating_average = ?, number_ratings = ? WHERE id = ?",[req.params.average,req,params.number,req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({error: "Note not found"});
        }
        return true;
    }
    catch (err){
        res.status(500).json({error: err.message});
    }
});


module.exports = router;