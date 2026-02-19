const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/getByEmail/:email", async (req, res) => {
    try{
        const user = await db.query("SELECT * FROM user_data WHERE email = ?",[req.params.email]);
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/addUser",async (req,res) =>{
    try{
        const {email,passkey,lecturer,points} = req.body;
        const [result] = await db.query("INSERT INTO user_data (email,passkey,lecturer,points) VALUES (?, ?, ?, ?)",[email,passkey,lecturer,points]);
        return true;
    }
    catch (err){
        res.status(500).json({ error: err.message });
    }
});

router.delete("/deleteUser/:email", async (req,res) =>{
    try{
        const [result] = await db.query("DELETE FROM user_data WHERE email = ?",[req.params.email]);
        if (result.affectedRows == 0){
            return res.status(404).json({error: "User not found"});
        }
        return true;

    }
    catch (err){
        res.status(500).json({error: err.message});
    }
});

router.put("/updateUser/:email", async (req,res) =>{
    try{
        const {passkey,lecturer,points} = req.body;
        const [result] = await db.query("UPDATE user_data SET passkey = ?, lecturer = ?, points = ? WHERE email = ?",[passkey,lecturer,points,req.params.email]);
        if (result.affectedRows == 0){
            return res.status(404).json({error: "User not found"});
        }
        return true;
    }
    catch (err){
        res.status(500).json({error: err.message});
    }
});

module.exports = router;
