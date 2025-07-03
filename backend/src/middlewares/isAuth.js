import httpStatus from "http-status";
import jwt from "jsonwebtoken";

async function authenticateToken(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "No token provided",
        success: false,
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next(); // Move to the next middleware or route
  } catch (err) {
    return res
      .status(httpStatus.FORBIDDEN)
      .json({ message: "Invalid or expired token", success: false });
  }
}

export { authenticateToken };
