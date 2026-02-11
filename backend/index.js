// Possible TODOs:
// - Verify token expiration (e.g., 24 hours)
// - Implement password reset functionality
// - Add rate limiting to prevent brute-force attacks
// - Signed tokens for quier login (JWT)
// - Use environment variables for secrets and database configuration


const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const app = express();
const JWT_SECRET = "your_mom";
const data = []; // Temporary in-memory "database" (replace with real database)


// Allows Express to read JSON (otherwise silent failure)
app.use(express.json());

// Registration validation rules
const RegistrationRules = {
  name: {
    required: true,
    minLength: 2,
  },
  email: {
    required: true,
    pattern: /^[a-zA-Z0-9]+@bath\.ac\.uk$/,
  },
  password: {
    required: true,
    minLength: 8,
    patterns: [
      { regex: /[a-z]/, message: "Must contain at least one lowercase letter." },
      { regex: /[A-Z]/, message: "Must contain at least one uppercase letter." },
      { regex: /[0-9]/, message: "Must contain at least one number." },
      { regex: /[!@#$%^&*(),.?":{}|<>]/, message: "Must contain at least one symbol." },
    ],
  },
};

// Validation function
function validateRegistration(data) {
  const errors = [];

  // Validate name
  if (!data.name || data.name.trim() === "") {
    errors.push("Name is required.");
  } else if (data.name.length < RegistrationRules.name.minLength) {
    errors.push(`Name must be at least ${RegistrationRules.name.minLength} characters.`);
  }

  // Validate email
  if (!data.email || data.email.trim() === "") {
    errors.push("Email is required.");
  } else if (!RegistrationRules.email.pattern.test(data.email)) {
    errors.push("Email must be a valid Bath University address (e.g., user@bath.ac.uk).");
  }

  // Validate password
  if (!data.password || data.password === "") {
    errors.push("Password is required.");
  } else {
    if (data.password.length < RegistrationRules.password.minLength) {
      errors.push(`Password must be at least ${RegistrationRules.password.minLength} characters.`);
    }
    
    // Check all password patterns
    RegistrationRules.password.patterns.forEach(({ regex, message }) => {
      if (!regex.test(data.password)) {
        errors.push(message);
      }
    });
  }

  return errors;
}

// Register User
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  const validationErrors = validateRegistration({ name, email, password });
  
  if (validationErrors.length > 0) {
    return res.status(400).json({
      ok: false,
      errors: validationErrors,
    });
  }

  // Check if email already exists in database
  const existingUser = data.find(user => user.email === email);
  if (existingUser) {
    return res.status(409).json({
      ok: false,
      errors: ["Email is already registered."],
    });
  }

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 12);

  // Save user to database
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyLink = `http://localhost:3000/api/confirm?token=${verifyToken}`;
  data.push({ 
    name, 
    email, 
    hashedPassword, 
    verified: false, 
    verifyToken,
  });

  res.json({
    ok: true,
    message: "Account created successfully",
    body: { name, email, hashedPassword, verifyLink }, // For testing purposes only – do not return password in real applications
  });
})

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      message: "Email and password are required.",
    });
  }

  const user = data.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({
      ok: false,
      message: "Invalid email or password.",
    });
  }

  if (!user.verified) {
    return res.status(403).json({
      ok: false,
      message: "Email not verified. Please check your inbox.",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

  if (!isPasswordValid) {
    return res.status(401).json({
      ok: false,
      message: "Invalid email or password.",
    });
  }

  const token = jwt.sign(
    { email: user.email }, 
    JWT_SECRET, 
    { expiresIn: "12h" }
  );

  res.json({
    ok: true,
    message: "Login successful.",
    token,
  });
});


app.get("/api/confirm", (req, res) => {
  const { token } = req.query;

  const user = data.find(u => u.verifyToken === token);

  if (!user) {
    return res.status(400).json({
      ok: false,
      message: "Invalid or expired token.",
    });
  }

  user.verified = true;
  user.verifyToken = null; // Invalidate token after use

  res.json({
    ok: true,
    message: "Email verified successfully!",
  });
});

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

app.get("/api/me", requireAuth, (req, res) => {
  res.json({
    ok: true,
    user: req.user
  });
});


// Creates a server that listens at port 3000
app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});