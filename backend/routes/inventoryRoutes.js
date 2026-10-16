const express=require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const {
    getInventory,
    getMedicineStock
}=require("../controllers/inventoryController");

const router=express.Router();

router.get("/", verifyToken, authorizeRoles("Admin", "Pharmacist", "Cashier"), getInventory);
router.get("/medicine/:medicineId", verifyToken, authorizeRoles("Admin", "Pharmacist", "Cashier"), getMedicineStock);

module.exports=router;