const Batch = require("../models/batch");
const Medicine = require("../models/medicine");
const StockMovement = require("../models/stockMovement");

// Turn a Mongoose error into a clear response for the frontend
const sendError = (res, error, defaultMessage) => {
    if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({ message: errors.join(", "), errors });
    }
    if (error.name === "CastError") {
        return res.status(400).json({ message: "Invalid id" });
    }
    return res.status(500).json({ message: defaultMessage, error: error.message });
};

// POST /api/batches - add a batch by hand (normally batches come from purchases)
exports.createBatch = async (req, res) => {
    try {
        const { medicine, batchNumber, expiryDate, purchasePrice, sellingPrice, quantity } = req.body;

        const medicineExists = await Medicine.findById(medicine).catch(() => null);
        if (!medicineExists) {
            return res.status(404).json({ message: "Medicine not found" });
        }

        const batch = await Batch.create({
            medicine,
            batchNumber,
            expiryDate,
            purchasePrice,
            sellingPrice,
            quantity
        });

        // Record the manual stock change in the audit trail
        if (batch.quantity > 0) {
            await StockMovement.create({
                medicine: batch.medicine,
                batch: batch._id,
                type: "ADJUSTMENT",
                quantity: batch.quantity,
                note: "Batch added manually",
                performedBy: req.user ? req.user.id : undefined
            });
        }

        res.status(201).json(batch);
    } catch (error) {
        sendError(res, error, "Failed to create batch");
    }
};

// GET /api/batches - all batches
exports.getMedicineBatches = async (req, res) => {
    try {
        const batches = await Batch.find()
            .populate("medicine", "name genericName")
            .sort({ expiryDate: 1 });

        res.status(200).json(batches);
    } catch (error) {
        sendError(res, error, "Can't fetch all batches");
    }
};

// GET /api/batches/medicine/:medicineId - batches of one medicine
exports.getMedicineBatch = async (req, res) => {
    try {
        const batches = await Batch.find({ medicine: req.params.medicineId })
            .sort({ expiryDate: 1 });

        res.status(200).json(batches);
    } catch (error) {
        sendError(res, error, "Can't fetch batches for this medicine");
    }
};

// PUT /api/batches/:id
exports.updateBatch = async (req, res) => {
    try {
        const oldBatch = await Batch.findById(req.params.id);
        if (!oldBatch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // If the quantity was corrected by hand, record it in the audit trail
        const difference = batch.quantity - oldBatch.quantity;
        if (difference !== 0) {
            await StockMovement.create({
                medicine: batch.medicine,
                batch: batch._id,
                type: "ADJUSTMENT",
                quantity: difference,
                note: "Batch quantity corrected manually",
                performedBy: req.user ? req.user.id : undefined
            });
        }

        res.status(200).json(batch);
    } catch (error) {
        sendError(res, error, "Failed to update batch");
    }
};

// DELETE /api/batches/:id
exports.deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findByIdAndDelete(req.params.id);
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }
        res.status(200).json({ message: "Batch deleted successfully" });
    } catch (error) {
        sendError(res, error, "Failed to delete batch");
    }
};
