const User = require("../models/user");
const jwt = require("jsonwebtoken");

const ROLES = ["Admin", "Pharmacist", "Cashier"];

const generateToken = (id, role, name) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured.");
    }
    return jwt.sign({ id, role, name }, secret, { expiresIn: "1d" });
};

// Only send safe fields back to the frontend (never the password)
const userResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
});

// Check name / email / password and return an error message, or "" if valid
const validateUserInput = (name, email, password) => {
    if (!name || !name.trim() || !email || !password) {
        return "Name, email, and password are required";
    }
    if (password.length < 8) {
        return "Password must be at least 8 characters long";
    }
    return "";
};

// POST /api/auth/register  (public signup)
exports.register = async (req, res) => {
    try {
        if (!process.env.JWT_SECRET) {
            console.error("Signup unavailable: JWT_SECRET is not configured.");
            return res.status(500).json({ message: "Server authentication is not configured. Set JWT_SECRET and restart the backend." });
        }

        const { name, email, password } = req.body;
        const errorMessage = validateUserInput(name, email, password);
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        // The very first account becomes the Admin so the system can be set up.
        // Every account after that is a Cashier (Admin can change roles later).
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? "Admin" : "Cashier";

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role
        });
        const token = generateToken(user._id, user.role, user.name);

        return res.status(201).json({
            message: "Account created successfully",
            token,
            user: userResponse(user)
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }
        console.error("Signup failed:", error);
        return res.status(500).json({ message: "Server error during signup" });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Emails are stored in lowercase, so search in lowercase too
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user._id, user.role, user.name);

        res.status(200).json({
            message: "Login successful",
            token,
            user: userResponse(user)
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during login", error: error.message });
    }
};

// GET /api/auth/users  (Admin only)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

// POST /api/auth/users  (Admin only) - create a staff account with any role
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const errorMessage = validateUserInput(name, email, password);
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage });
        }
        if (!ROLES.includes(role)) {
            return res.status(400).json({ message: "Role must be Admin, Pharmacist or Cashier" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role });
        res.status(201).json(userResponse(user));
    } catch (error) {
        res.status(500).json({ message: "Failed to create user", error: error.message });
    }
};

// PUT /api/auth/users/:id/role  (Admin only)
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!ROLES.includes(role)) {
            return res.status(400).json({ message: "Role must be Admin, Pharmacist or Cashier" });
        }
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: "You cannot change your own role" });
        }

        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid user id" });
        }
        res.status(500).json({ message: "Failed to update role", error: error.message });
    }
};

// DELETE /api/auth/users/:id  (Admin only)
exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid user id" });
        }
        res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
};
