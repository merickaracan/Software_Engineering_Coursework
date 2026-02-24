const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "default";

const requireAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      ok: false,
      message: "No token provided. Please log in.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      ok: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = requireAuth;