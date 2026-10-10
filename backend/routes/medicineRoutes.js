const express = require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const {
    createMedicine,
    getAllMedicines,
    getMedicine,
    deleteMedicine,
    updateMedicine,
} = require("../controllers/medicineController");

const router = express.Router();

router.post("/", verifyToken, authorizeRoles("Admin", "Pharmacist"), createMedicine);
router.get("/", verifyToken, authorizeRoles("Admin", "Pharmacist", "Cashier"), getAllMedicines);
router.get("/:id", verifyToken, authorizeRoles("Admin", "Pharmacist", "Cashier"), getMedicine);
router.put("/:id", verifyToken, authorizeRoles("Admin", "Pharmacist"), updateMedicine);
router.delete("/:id", verifyToken, authorizeRoles("Admin", "Pharmacist"), deleteMedicine);

module.exports = router;