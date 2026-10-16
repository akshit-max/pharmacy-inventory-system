const express = require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const {
    register,
    login,
    getUsers,
    createUser,
    updateUserRole,
    deleteUser
} = require("../controllers/authController");

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Admin only: manage staff accounts
router.get("/users", verifyToken, authorizeRoles("Admin"), getUsers);
router.post("/users", verifyToken, authorizeRoles("Admin"), createUser);
router.put("/users/:id/role", verifyToken, authorizeRoles("Admin"), updateUserRole);
router.delete("/users/:id", verifyToken, authorizeRoles("Admin"), deleteUser);

module.exports = router;
