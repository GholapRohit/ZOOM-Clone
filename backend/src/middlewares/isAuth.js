import httpStatus from "http-status"; // Import HTTP status codes for readable responses
import jwt from "jsonwebtoken"; // Import JWT library for verifying tokens

// Middleware function to authenticate JWT token from cookies
async function authenticateToken(req, res, next) {
  try {
    const token = req.cookies.token; // Get the token from the request cookies

    // If no token is found, respond with 401 Unauthorized
    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "No token provided",
        success: false,
      });
    }

    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = decoded; // Attach decoded user info to the request object

    next(); // Move to the next middleware or route handler
  } catch (err) {
    // If token is invalid or expired, respond with 403 Forbidden
    return res
      .status(httpStatus.FORBIDDEN)
      .json({ message: "Invalid or expired token", success: false });
  }
}

export { authenticateToken }; // Export the middleware for use in routes
