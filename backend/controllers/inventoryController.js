const Batch = require("../models/batch")
const Medicine = require("../models/medicine")

// GET /api/inventory - every batch with its expiry and low-stock status
exports.getInventory = async (req, res) => {
    try {
        const batches = await Batch.find()
            .populate("medicine", "name genericName category manufacturer reorderLevel")
            .sort({ expiryDate: 1 });
        const medicines = await Medicine.find().select("reorderLevel");

        const today = new Date();

        // Total UNEXPIRED stock of each medicine (medicineId -> quantity).
        // Reorder levels apply to the medicine's total stock, not to one batch.
        const medicineStock = {};
        batches.forEach((batch) => {
            if (!batch.medicine) return;
            if (new Date(batch.expiryDate) > today) {
                const medId = batch.medicine._id.toString();
                medicineStock[medId] = (medicineStock[medId] || 0) + batch.quantity;
            }
        });

        const isMedicineLow = (medicineId, reorderLevel) =>
            (medicineStock[medicineId] || 0) <= (reorderLevel ?? 10);

        // Count low-stock medicines (including medicines with no batches at all)
        const lowStockMedicines = medicines.filter((medicine) =>
            isMedicineLow(medicine._id.toString(), medicine.reorderLevel)
        ).length;

        const inventory = batches.map((batch) => {
            const isExpired = new Date(batch.expiryDate) < today;
            const isLowStock = Boolean(batch.medicine) && !isExpired &&
                isMedicineLow(batch.medicine._id.toString(), batch.medicine.reorderLevel);

            return {
                _id: batch._id,
                medicine: batch.medicine,
                batchNumber: batch.batchNumber,
                expiryDate: batch.expiryDate,
                purchasePrice: batch.purchasePrice,
                sellingPrice: batch.sellingPrice,
                quantity: batch.quantity,
                isExpired,
                isLowStock,
            };
        });

        res.status(200).json({
            inventory,
            summary: { lowStockMedicines }
        });
    } catch (error) {
        res.status(500).json({
            message: "Can't get inventory details",
            error: error.message
        });
    }
};

// GET /api/inventory/medicine/:medicineId - total stock of one medicine
exports.getMedicineStock = async (req, res) => {
    try {
        const batches = await Batch.find({ medicine: req.params.medicineId })
            .sort({ expiryDate: 1 });

        const totalQuantity = batches.reduce((total, batch) => total + batch.quantity, 0);

        res.status(200).json({
            medicine: req.params.medicineId,
            totalQuantity,
            batches
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid medicine id" });
        }
        return res.status(500).json({
            message: "Failed to calculate stock",
            error: error.message
        });
    }
}
