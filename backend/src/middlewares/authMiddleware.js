// src/middlewares/authMiddleware.js
import User from "#src/models/User.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied - No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and attach to request
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ✅ Role-based Authorization Middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - No user data" });
    }

    if (req.user.role === "admin") return next(); // Admin bypasses role check

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden - You do not have access" });
    }

    next();
  };
};

export default authMiddleware;
export { authorize };
