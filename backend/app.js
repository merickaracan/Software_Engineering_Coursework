// Loading secrets and keys from .env file, to avoid pushing them publicly to GitHub.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors());
app.use(cookieParser());
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