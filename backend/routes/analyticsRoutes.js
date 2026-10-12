const express = require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");
const { getDashboardStats, getReorderRecommendations, getExpiryRisks } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/dashboard", verifyToken, authorizeRoles("Admin", "Pharmacist", "Cashier"), getDashboardStats);
router.get("/reorder-recommendations", verifyToken, authorizeRoles("Admin", "Pharmacist"), getReorderRecommendations);
router.get("/expiry-risks", verifyToken, authorizeRoles("Admin", "Pharmacist"), getExpiryRisks);

module.exports = router;
