const express=require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const{
    createPurchase,
    getPurchase,
    getPurchases,
}=require("../controllers/purchaseController");


const router=express.Router();

router.post("/", verifyToken, authorizeRoles("Admin"), createPurchase);
router.get("/", verifyToken, authorizeRoles("Admin", "Pharmacist"), getPurchases);
router.get("/:id", verifyToken, authorizeRoles("Admin", "Pharmacist"), getPurchase);

module.exports=router;