const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "default";

function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ ok: false, message: "Authorization header missing." });
  }

  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ ok: false, message: "Invalid authorization format." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // attach user info for later
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid or expired token" });
  }
}

module.exports = requireAuth;