const User = require("../models/user");
const jwt = require("jsonwebtoken");

const generateToken = (id, role, name) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured.");
    }
    return jwt.sign({ id, role, name }, secret, { expiresIn: "1d" });
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
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
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during login", error: error.message });
    }
};

// Seed Initial Admin (Run once safely)
exports.createInitialAdmin = async (req, res) => {
    try {
        const adminExists = await User.findOne({ role: "Admin" });
        if (adminExists) {
            return res.status(400).json({ message: "Admin user already exists. Setup complete." });
        }

        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password required to create initial admin" });
        }

        const admin = await User.create({
            name,
            email,
            password,
            role: "Admin"
        });

        res.status(201).json({
            message: "Initial Admin created successfully. Please delete this endpoint after use or keep it protected."
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to create initial admin", error: error.message });
    }
};
