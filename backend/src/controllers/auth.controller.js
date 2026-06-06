import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const generateToken = (user, rememberMe = false) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: rememberMe ? "30d" : process.env.JWT_EXPIRES_IN || "1d",
    },
  );
};

export const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await prisma.users.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        password: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = generateToken(user, Boolean(rememberMe));

    return res.json({
      success: true,
      message: "Login successfully",
      data: {
        accessToken,
        expiresIn: rememberMe ? "30d" : process.env.JWT_EXPIRES_IN || "1d",
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const register = async (req, res) => {
  try {
    const { username, fullName, full_name: fullNameSnake, email, password } = req.body;

    const normalizedUsername = String(username || "").trim();
    const normalizedFullName = String(fullName || fullNameSnake || "").trim();
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedUsername || !normalizedFullName || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, full name, email, and password are required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ username: normalizedUsername }, { email: normalizedEmail }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.username === normalizedUsername
            ? "Username already exists"
            : "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await prisma.users.create({
      data: {
        username: normalizedUsername,
        password: hashedPassword,
        full_name: normalizedFullName,
        email: normalizedEmail,
        role: "USER",
        status: "ACTIVE",
      },
      select: {
        id: true,
        username: true,
        full_name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email or username already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  return res.json({
    success: true,
    message: "Logout successfully",
  });
};
