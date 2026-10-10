const express = require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const{
    createSupplier,
    getSuppliers,
    getSupplier,
    updateSupplier,
    deleteSupplier
}=require("../controllers/supplierController");

const router= express.Router();

router.post("/", verifyToken, authorizeRoles("Admin"), createSupplier);
router.get("/", verifyToken, authorizeRoles("Admin", "Pharmacist"), getSuppliers);
router.get("/:id", verifyToken, authorizeRoles("Admin", "Pharmacist"), getSupplier);
router.put("/:id", verifyToken, authorizeRoles("Admin"), updateSupplier);
router.delete("/:id", verifyToken, authorizeRoles("Admin"), deleteSupplier);

module.exports=router;
