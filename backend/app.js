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
app.use("/api", authRoutes);

module.exports = app;