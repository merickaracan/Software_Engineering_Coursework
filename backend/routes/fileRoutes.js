const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

const UPLOADS_DIR = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext);
    },
});

const upload = multer({ storage });

// Upload files for a note
router.post("/notes/:id/files", upload.array("files"), async (req, res) => {
    try {
        const noteId = req.params.id;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ ok: false, error: "No files uploaded." });
        }

        const inserts = files.map((f) =>
            db.query(
                "INSERT INTO note_files (note_id, filename, stored_name) VALUES (?, ?, ?)",
                [noteId, f.originalname, f.filename]
            )
        );
        await Promise.all(inserts);

        res.status(201).json({ ok: true, message: "Files uploaded.", count: files.length });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// List files for a note
router.get("/notes/:id/files", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, note_id, filename, stored_name, uploaded_at FROM note_files WHERE note_id = ?",
            [req.params.id]
        );
        res.status(200).json({ ok: true, data: rows });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Preview a file inline by its DB id
router.get("/files/:fileId/preview", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT filename, stored_name FROM note_files WHERE id = ?",
            [req.params.fileId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ ok: false, error: "File not found." });
        }
        const { stored_name } = rows[0];
        const filePath = path.join(UPLOADS_DIR, stored_name);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ ok: false, error: "File missing from storage." });
        }
        res.sendFile(filePath);
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Download a file by its DB id
router.get("/files/:fileId", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT filename, stored_name FROM note_files WHERE id = ?",
            [req.params.fileId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ ok: false, error: "File not found." });
        }
        const { filename, stored_name } = rows[0];
        const filePath = path.join(UPLOADS_DIR, stored_name);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ ok: false, error: "File missing from storage." });
        }
        res.download(filePath, filename);
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Delete a file by its DB id
router.delete("/files/:fileId", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT stored_name FROM note_files WHERE id = ?",
            [req.params.fileId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ ok: false, error: "File not found." });
        }
        const filePath = path.join(UPLOADS_DIR, rows[0].stored_name);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await db.query("DELETE FROM note_files WHERE id = ?", [req.params.fileId]);
        res.status(200).json({ ok: true, message: "File deleted." });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
