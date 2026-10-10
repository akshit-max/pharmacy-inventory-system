const express=require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const{
    createBatch,
    getMedicineBatch,
    getMedicineBatches,
    updateBatch,
    deleteBatch
}=require("../controllers/batchController");

const router=express.Router();

router.post("/", verifyToken, authorizeRoles("Admin"), createBatch);
router.get("/", verifyToken, authorizeRoles("Admin", "Pharmacist", "Cashier"), getMedicineBatches);

router.get(
  "/medicine/:medicineId",
  verifyToken, authorizeRoles("Admin", "Pharmacist", "Cashier"),
  getMedicineBatches
);

router.put("/:id", verifyToken, authorizeRoles("Admin", "Pharmacist"), updateBatch);
router.delete("/:id", verifyToken, authorizeRoles("Admin"), deleteBatch);

module.exports=router;