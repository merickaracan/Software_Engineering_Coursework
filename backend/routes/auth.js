const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const requireAuth = require("../middleware/requireAuth");
const { getUser, createUser, updateUser, deleteUser } = require("../services/userService");

const JWT_SECRET = process.env.JWT_SECRET || "default";

// Registration validation rules
const RegistrationRules = {
  name: {
    required: true,
    minLength: 2,
  },
  email: {
    required: true,
    pattern: /^[a-zA-Z0-9.]+@bath\.ac\.uk$/,
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
router.post("/register", async (req, res) => {
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
  const existingUser = await getUser(email);
  if (existingUser) {
    return res.status(409).json({
      ok: false,
      errors: ["Email is already registered."],
    });
  }

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 12);

  // Add data to database
  await createUser(email, hashedPassword);

  res.json({
    ok: true,
    message: "Account created successfully",
  });
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      message: "Email and password are required.",
    });
  }

  const user = await getUser(email);

  if (user === null) {
    return res.status(401).json({
      ok: false,
      message: "Invalid email or password.",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passkey);

  if (!isPasswordValid) {
    return res.status(401).json({
      ok: false,
      message: "Invalid email or password.",
    });
  }

  // Create JWT token
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });

  // Send as HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.json({
    ok: true,
    message: "Login successful.",
  });
});

// Logout User
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    ok: true,
    message: "Logged out successfully.",
  });
});


router.get("/me", requireAuth, (req, res) => {
  res.json({
    ok: true,
    user: req.user
  });
});

module.exports = router;