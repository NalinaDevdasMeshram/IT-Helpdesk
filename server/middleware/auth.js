import User from "../models/User.js";
import jwt from "jsonwebtoken";

//Authentication middleware
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    //check for  Bearer Token
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ message: "Not authorized, missing token" });
    }
    // extract token
    const token = authHeader.split(" ")[1];
    console.log("token", token);
    // verify jwt
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);
    // find logged-in user
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(401).json({ message: "User no longer exists" });
    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Not authorized, token invalid or expired" });
  }
};

export const allow =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to do this" });
    }
    next();
  };
