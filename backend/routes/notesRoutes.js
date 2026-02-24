const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/notes/:id",async (req,res) =>{
    try{
        const [rows] = await db.query("SELECT * FROM notes WHERE id = ?",[req.params.id]);
        res.status(200).json({ ok: true, data: rows });
        }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
        }
});

router.get("/notes/module/:module",async (req,res) =>{
    try{
        const [rows] = await db.query("SELECT * FROM notes WHERE module = ?",[req.params.module]);
        res.status(200).json({ ok: true, data: rows });
        }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
        }
});

router.get("/notes/email/:email",async (req,res) =>{
    try{
        const [rows] = await db.query("SELECT * FROM notes WHERE email = ?",[req.params.email]);
        res.status(200).json({ ok: true, data: rows });
        }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
        }
});

router.post("/notes",async (req,res) =>{
    try{
        const {email,verified,note_data,rating_average,number_ratings,module} = req.body;
        const [result] = await db.query("INSERT INTO notes (email,verified,note_data,rating_average,number_ratings,module) VALUES (?, ?, ?, ?, ?, ?)",[email,verified,note_data,rating_average,number_ratings,module]);
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
        const {email,verified,note_data,rating_average,number_ratings,module} = req.body;
        const [result] = await db.query("UPDATE notes SET email = ?,verified = ?,note_data = ?,rating_average = ?,number_ratings = ?,module = ?  WHERE id = ?",[email,verified,note_data,rating_average,number_ratings,module,req.params.id]);
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
        const [result] = await db.query("UPDATE notes SET verified = ? WHERE id = ?",[1,req.params.id]);
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
        const [result] = await db.query("UPDATE notes SET verified = ? WHERE id = ?",[0,req.params.id]);
        if (result.affectedRows == 0){
            return res.status(404).json({ ok: false, error: "Note not found" });
        }
        return res.status(200).json({ ok: true, message: "Note unverified" });
    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.put("/notes/rating", async (req,res) =>{
    try{
        const { id, average, number } = req.body;
        const [result] = await db.query(
            "UPDATE notes SET rating_average = ?, number_ratings = ? WHERE id = ?",
            [average, number, id]
        );
        if (result.affectedRows == 0){
            return res.status(404).json({ ok: false, error: "Note not found" });
        }
        return res.status(200).json({ ok: true, message: "Note rating updated" });
    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});


module.exports = router;