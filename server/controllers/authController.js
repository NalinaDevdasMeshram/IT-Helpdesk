import User from "../models/User.js";
import JWT from "jsonwebtoken";

// Generate token
const tokenSign = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};
console.log("tokenSign", tokenSign);
// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All feild required" });
    }
    // password length must be 6
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const normalEmail = email.trim().toLowerCase();

    //checking existing user
    const existUser = await User.findOne({
      email: normalEmail,
    });
    if (existUser) {
      return res.status(409).json({ message: "EmailID already exist." });
    }

    // save data in Database
    const user = await User.create({
      name: name,
      email: normalEmail,
      password,
    });
    return res.status(201).json({
      message: "Registed Successfully..",
      token: tokenSign(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email Already exist." });
    }
    return res
      .status(404)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// Login User

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(404)
        .json({ message: "email and password both required" });
    }

    // find user and retrive hashed password

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    // verify the password
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    return res.status(200).json({
      message: "Login Successfully",
      token: tokenSign(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
};

//get the user Details

export const getMyDetails = async (req, res) => {
  return res.status(200).json({
    message: "User fetched successfully",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
