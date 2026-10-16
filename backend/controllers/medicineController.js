const Medicine = require("../models/medicine");
const Batch = require("../models/batch");

// Turn a Mongoose error into a clear response for the frontend
const sendError = (res, error, defaultMessage) => {
    if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({ message: errors.join(", "), errors });
    }
    if (error.name === "CastError") {
        return res.status(400).json({ message: "Invalid medicine id" });
    }
    return res.status(500).json({ message: defaultMessage, error: error.message });
};

// Escape special characters so user search text is treated as plain text
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.createMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.create(req.body);
        res.status(201).json(medicine);
    } catch (error) {
        sendError(res, error, "Failed to create medicine");
    }
};

exports.getAllMedicines = async (req, res) => {
    try {
        const { search, category } = req.query;
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const filter = {};

        if (search) {
            const safeSearch = escapeRegex(search);
            filter.$or = [
                { name: { $regex: safeSearch, $options: "i" } },
                { genericName: { $regex: safeSearch, $options: "i" } },
                { category: { $regex: safeSearch, $options: "i" } },
            ];
        }

        if (category) {
            filter.category = category;
        }

        const skip = (page - 1) * limit;
        const medicines = await Medicine.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Medicine.countDocuments(filter);
        res.status(200).json({
            medicines,
            currentPage: page,
            totalPages: Math.max(Math.ceil(total / limit), 1),
            totalMedicines: total,
        });
    } catch (error) {
        sendError(res, error, "Failed to get all medicines");
    }
};

exports.getMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({ message: "Cannot find medicine" });
        }

        res.status(200).json(medicine);
    } catch (error) {
        sendError(res, error, "Failed to fetch medicine");
    }
};

exports.updateMedicine = async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }

        res.status(200).json(medicine);
    } catch (error) {
        sendError(res, error, "Failed to update medicine");
    }
};

exports.deleteMedicine = async (req, res) => {
    try {
        // Do not delete a medicine that still has batches - the batches,
        // sales and audit trail would point to a medicine that no longer exists.
        const batchCount = await Batch.countDocuments({ medicine: req.params.id });
        if (batchCount > 0) {
            return res.status(400).json({
                message: "This medicine has stock batches and cannot be deleted"
            });
        }

        const medicine = await Medicine.findByIdAndDelete(req.params.id);
        if (!medicine) {
            return res.status(404).json({ message: "No such medicine exists" });
        }

        res.status(200).json({ message: "Medicine deleted successfully" });
    } catch (error) {
        sendError(res, error, "Failed to delete medicine");
    }
};
