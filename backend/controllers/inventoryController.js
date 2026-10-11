const Batch = require("../models/batch")

exports.getInventory = async (req, res) => {
    try {
        const batches = await Batch.find()
            .populate(
                "medicine",
                "name genericName category manufacturer reorderLevel"
            )
            .sort({ expiryDate: 1 });

        const today = new Date();

        // Step 1: Aggregate total UNEXPIRED quantity per medicine so that
        // isLowStock reflects the medicine-level stock, not a single batch.
        // This is consistent with how analyticsController computes lowStockAlerts.
        const medicineStock = {};
        batches.forEach((batch) => {
            const medId = batch.medicine?._id?.toString();
            if (!medId) return;
            if (new Date(batch.expiryDate) > today) {
                medicineStock[medId] = (medicineStock[medId] || 0) + batch.quantity;
            }
        });

        // Step 2: Build the response array with corrected isExpired and isLowStock.
        const inventory = batches.map((batch) => {
            const expiry = new Date(batch.expiryDate);

            // FIX: was `expiry > today` which was inverted — expired batches were
            // being marked as "not expired" and vice versa.
            const isExpired = expiry < today;

            // FIX: compare total medicine stock (unexpired) against the reorderLevel,
            // not the quantity of this individual batch. Orphaned batches without medicine
            // reference are guarded against false low-stock flags.
            const medId = batch.medicine?._id?.toString();
            const totalMedicineStock = medicineStock[medId] || 0;
            const isLowStock = Boolean(batch.medicine) && !isExpired && totalMedicineStock <= (batch.medicine.reorderLevel ?? 10);

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

        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({
            message: "Can't get Inventory details",
            error: error.message
        });
    }
};

exports.getMedicineStock= async(req,res)=>{
    try{
        const batches = await Batch.find({
            medicine: req.params.medicineId
        });
        const totalQuantity=batches.reduce(
            (total,batch)=>total+batch.quantity,
            0
        );
        res.status(200).json({
            medicine: req.params.medicineId,
            totalQuantity,
            batches
        });
    }
    catch(error){
        return res.status(500).json({
            message: "Failed to calculate stock",
            error: error.message
        })
    }
}