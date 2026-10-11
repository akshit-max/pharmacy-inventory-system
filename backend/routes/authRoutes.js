const express = require("express");
const { register, login, createInitialAdmin } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/setup-admin", createInitialAdmin);

module.exports = router;
