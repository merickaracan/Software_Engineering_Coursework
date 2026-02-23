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
app.use("/api", authRoutes);

module.exports = app;