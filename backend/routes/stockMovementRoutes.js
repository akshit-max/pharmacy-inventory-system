const express=require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const {
    getStockMovements
}=require("../controllers/stockMovementController")

const router=express.Router();

router.get("/", verifyToken, authorizeRoles("Admin", "Pharmacist"), getStockMovements); 
module.exports= router;