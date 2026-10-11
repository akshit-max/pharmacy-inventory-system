const express=require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const{
    createSale,
    getSales,
    getSaleById,
}=require("../controllers/saleController");

const router=express.Router();
router.post("/", verifyToken, authorizeRoles("Admin", "Pharmacist", "Cashier"), createSale);
router.get("/", verifyToken, authorizeRoles("Admin", "Pharmacist", "Cashier"), getSales);
router.get("/:id", verifyToken, authorizeRoles("Admin", "Pharmacist", "Cashier"), getSaleById);

module.exports=router;