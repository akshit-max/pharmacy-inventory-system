const express=require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const{
    createSale
}=require("../controllers/saleController");

const router=express.Router();
router.post("/", verifyToken, authorizeRoles("Admin", "Pharmacist", "Cashier"), createSale);

module.exports=router;