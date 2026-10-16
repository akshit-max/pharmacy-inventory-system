const express = require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const {
    getDashBoardStats
} = require("../controllers/dashBoardController");

const router = express.Router();

router.get("/", verifyToken, authorizeRoles("Admin", "Pharmacist"), getDashBoardStats);

module.exports = router;
