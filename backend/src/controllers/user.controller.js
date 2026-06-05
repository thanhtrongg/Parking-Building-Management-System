import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const VALID_ROLES = ["ADMIN", "MANAGER", "STAFF", "USER"];
const VALID_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"];

const isValidUUID = (id) => {
  return typeof id === "string" && UUID_REGEX.test(id);
};

const normalizeEmail = (email) => {
  return String(email || "")
    .trim()
    .toLowerCase();
};

const normalizeEnum = (value) => {
  return String(value || "")
    .trim()
    .toUpperCase();
};

const getDefaultUsername = (email) => {
  const emailName = normalizeEmail(email).split("@")[0];
  return `${emailName || "user"}-${Date.now()}`;
};

const userSelect = {
  id: true,
  username: true,
  full_name: true,
  email: true,
  phone: true,
  role: true,
  status: true,
  created_at: true,
};

const mapUserResponse = (user) => {
  return {
    id: user.id,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.created_at,
  };
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: userSelect,
      orderBy: {
        created_at: "desc",
      },
    });

    return res.json({
      success: true,
      message: "Get users successfully",
      data: users.map(mapUserResponse),
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await prisma.users.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "Get user detail successfully",
      data: mapUserResponse(user),
    });
  } catch (error) {
    console.error("Get user detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const {
      username,
      fullName,
      full_name: fullNameSnake,
      email,
      phone,
      password,
      role = "USER",
      status = "ACTIVE",
    } = req.body;

    const normalizedEmail = normalizeEmail(email);
    const normalizedRole = normalizeEnum(role);
    const normalizedStatus = normalizeEnum(status);
    const normalizedFullName = String(fullName || fullNameSnake || "").trim();
    const normalizedUsername = String(
      username || getDefaultUsername(normalizedEmail),
    ).trim();

    if (!normalizedFullName || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    if (!VALID_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user status",
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
        OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email === normalizedEmail
            ? "Email already exists"
            : "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await prisma.users.create({
      data: {
        username: normalizedUsername,
        password: hashedPassword,
        full_name: normalizedFullName,
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : null,
        role: normalizedRole,
        status: normalizedStatus,
      },
      select: userSelect,
    });

    return res.status(201).json({
      success: true,
      message: "Create user successfully",
      data: mapUserResponse(user),
    });
  } catch (error) {
    console.error("Create user error:", error);

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

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      fullName,
      full_name: fullNameSnake,
      email,
      phone,
      password,
      role,
      status,
    } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const data = {};

    if (username !== undefined) {
      const normalizedUsername = String(username).trim();

      if (!normalizedUsername) {
        return res.status(400).json({
          success: false,
          message: "Username cannot be empty",
        });
      }

      data.username = normalizedUsername;
    }

    if (fullName !== undefined || fullNameSnake !== undefined) {
      const normalizedFullName = String(fullName || fullNameSnake || "").trim();

      if (!normalizedFullName) {
        return res.status(400).json({
          success: false,
          message: "Full name cannot be empty",
        });
      }

      data.full_name = normalizedFullName;
    }

    if (email !== undefined) {
      const normalizedEmail = normalizeEmail(email);

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty",
        });
      }

      data.email = normalizedEmail;
    }

    if (phone !== undefined) {
      data.phone = phone ? String(phone).trim() : null;
    }

    if (role !== undefined) {
      const normalizedRole = normalizeEnum(role);

      if (!VALID_ROLES.includes(normalizedRole)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role",
        });
      }

      data.role = normalizedRole;
    }

    if (status !== undefined) {
      const normalizedStatus = normalizeEnum(status);

      if (!VALID_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user status",
        });
      }

      data.status = normalizedStatus;
    }

    if (password !== undefined && password !== "") {
      if (String(password).length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      data.password = await bcrypt.hash(String(password), 10);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    if (id === req.user.id && data.role && data.role !== "ADMIN") {
      return res.status(400).json({
        success: false,
        message: "Cannot remove your own admin role",
      });
    }

    if (id === req.user.id && data.status && data.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate your own account",
      });
    }

    if (data.email || data.username) {
      const duplicateUser = await prisma.users.findFirst({
        where: {
          OR: [
            ...(data.email ? [{ email: data.email }] : []),
            ...(data.username ? [{ username: data.username }] : []),
          ],
          NOT: {
            id,
          },
        },
      });

      if (duplicateUser) {
        return res.status(409).json({
          success: false,
          message:
            duplicateUser.email === data.email
              ? "Email already exists"
              : "Username already exists",
        });
      }
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data,
      select: userSelect,
    });

    return res.json({
      success: true,
      message: "Update user successfully",
      data: mapUserResponse(updatedUser),
    });
  } catch (error) {
    console.error("Update user error:", error);

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

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const user = await prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await prisma.users.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Delete user successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user because it is used by other records",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
