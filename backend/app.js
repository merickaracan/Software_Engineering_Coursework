// Loading secrets and keys from .env file, to avoid pushing them publicly to GitHub.
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
// Allows Express to read JSON (otherwise silent failure)
app.use(express.json());

// Mount auth routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const notesRoutes = require("./routes/notesRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", notesRoutes);
app.use("/api", suggestionRoutes);

module.exports = app;