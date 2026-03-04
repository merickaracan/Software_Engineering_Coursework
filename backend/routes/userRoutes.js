const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/users/id/:id", async (req, res) => {
    try{
        const [rows] = await db.query("SELECT * FROM user_data WHERE id = ?",[req.params.id]);
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

router.put("/users/:email/profile-picture", async (req, res) => {
    try {
        const { profile_picture } = req.body;
        const [result] = await db.query(
            "UPDATE user_data SET profile_picture = ? WHERE email = ?",
            [profile_picture || null, req.params.email]
        );

        if (result.affectedRows == 0) {
            return res.status(404).json({ ok: false, error: "User not found" });
        }

        return res.status(200).json({ ok: true, message: "Profile picture updated" });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.post("/users",async (req,res) =>{
    try{
        const {email, name, password_hash,is_lecturer,points,profile_picture} = req.body;
        const [result] = await db.query("INSERT INTO user_data (email, name, password_hash,is_lecturer,points,profile_picture) VALUES (?, ?, ?, ?, ?, ?)",[email, name, password_hash,is_lecturer,points,profile_picture || null]);
        return res.status(201).json({
            ok: true,
            message: "User created",
            insertId: result.insertId
        });
    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.delete("/users/:email", async (req,res) =>{
    try{
        const [result] = await db.query("DELETE FROM user_data WHERE email = ?",[req.params.email]);
        if (result.affectedRows == 0){
            return res.status(404).json({ ok: false, error: "User not found" });
        }
        return res.status(200).json({ ok: true, message: "User deleted" });

    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});

router.put("/users/:email", async (req,res) =>{
    try{
        const {name, password_hash,is_lecturer,points} = req.body;
        const [result] = await db.query("UPDATE user_data SET name = ?, password_hash = ?, is_lecturer = ?, points = ? WHERE email = ?",[name, password_hash,is_lecturer,points,req.params.email]);
        if (result.affectedRows == 0){
            return res.status(404).json({ ok: false, error: "User not found" });
        }
        return res.status(200).json({ ok: true, message: "User updated" });
    }
    catch (err){
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;