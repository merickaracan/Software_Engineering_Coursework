const express = require("express");

const app = express();

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
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  const validationErrors = validateRegistration({ name, email, password, confirmPassword });
  
  if (validationErrors.length > 0) {
    return res.status(400).json({
      ok: false,
      errors: validationErrors,
    });
  }

  // TODO: Check if email already exists in database
  // TODO: Hash password before storing
  // TODO: Save user to database

  res.json({
    ok: true,
    message: "Account created successfully",
  });
})

// Creates a server that listens at port 3000
app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});