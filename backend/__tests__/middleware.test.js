const requireAuth = require("../middleware/requireAuth");
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET || "default";

jest.mock("jsonwebtoken");

describe("requireAuth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should reject requests without a token", () => {
    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "No token provided. Please log in.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should verify a valid token and attach user to request", () => {
    const mockUser = { email: "user@bath.ac.uk" };
    req.cookies.token = "valid.jwt.token";

    jwt.verify.mockReturnValueOnce(mockUser);

    requireAuth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("valid.jwt.token", jwt_secret);
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should reject requests with invalid tokens", () => {
    req.cookies.token = "invalid.token";

    jwt.verify.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Invalid or expired token.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should reject requests with expired tokens", () => {
    req.cookies.token = "expired.token";

    jwt.verify.mockImplementationOnce(() => {
      throw new Error("Token expired");
    });

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      message: "Invalid or expired token.",
    });
  });
});
