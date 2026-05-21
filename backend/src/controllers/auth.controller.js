const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role_name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    },
  );
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      `
      SELECT 
        users.id,
        users.full_name,
        users.email,
        users.password_hash,
        users.status,
        roles.name AS role_name
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.email = $1
      LIMIT 1
      `,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = generateToken(user);

    return res.json({
      success: true,
      message: "Login successfully",
      data: {
        accessToken,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role_name,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        users.id,
        users.full_name,
        users.email,
        users.phone,
        users.status,
        roles.name AS role_name
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = $1
      LIMIT 1
      `,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    return res.json({
      success: true,
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role_name,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.logout = async (req, res) => {
  return res.json({
    success: true,
    message: "Logout successfully",
  });
};
