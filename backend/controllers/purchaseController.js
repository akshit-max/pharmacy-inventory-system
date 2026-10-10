const mongoose = require("mongoose");
const Purchase = require("../models/purchase");
const Supplier = require("../models/supplier");
const Medicine = require("../models/medicine");
const Batch = require("../models/batch");
const StockMovement = require("../models/stockMovement");

exports.createPurchase = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const {
            supplier,
            invoiceNumber,
            purchaseDate,
            items
        } = req.body;

        if (!supplier || !invoiceNumber || !items || !items.length) {
            return res.status(400).json({ message: "Supplier, invoiceNumber, and items are required" });
        }

        const supplierExists = await Supplier.findById(supplier);
        if (!supplierExists) {
            return res.status(400).json({ message: "Supplier not found" });
        }

        // Validate all medicines and check quantities
        for (const item of items) {
            const medicineExists = await Medicine.findById(item.medicine);
            if (!medicineExists) {
                return res.status(400).json({ message: `Medicine not found: ${item.medicine}` });
            }
            if (item.quantity <= 0) {
                return res.status(400).json({ message: "Quantity must be positive" });
            }
        }

        const totalAmount = items.reduce((total, item) => total + (item.quantity * item.purchasePrice), 0);

        session.startTransaction();

        // Create Purchase
        const [purchase] = await Purchase.create([{
            supplier,
            invoiceNumber,
            purchaseDate,
            items,
            totalAmount,
        }], { session });

        // Update Inventory & Create Stock Movements
        for (const item of items) {
            let batch = await Batch.findOne({
                medicine: item.medicine,
                batchNumber: item.batchNumber
            }).session(session);

            if (batch) {
                batch.quantity += item.quantity;
                await batch.save({ session });
            } else {
                [batch] = await Batch.create([{
                    medicine: item.medicine,
                    batchNumber: item.batchNumber,
                    expiryDate: item.expiryDate,
                    purchasePrice: item.purchasePrice,
                    sellingPrice: item.sellingPrice,
                    quantity: item.quantity
                }], { session });
            }

            await StockMovement.create([{
                medicine: item.medicine,
                batch: batch._id,
                type: "PURCHASE",
                quantity: item.quantity,
                refernceId: purchase._id,
                note: `Purchase invoice ${invoiceNumber}`,
                performedBy: req.user ? req.user.id : undefined
            }], { session });
        }

        await session.commitTransaction();
        res.status(201).json(purchase);
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({
            message: "Failed to create Purchase",
            error: error.message
        });
    } finally {
        await session.endSession();
    }
};

exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .populate("supplier", "name phone")
            .populate("items.medicine", "name genericName")
            .sort({ purchaseDate: -1 });

        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch ALL purchases",
            error: error.message
        });
    }
};

exports.getPurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id)
            .populate("supplier", "name phone")
            .populate("items.medicine", "name genericName");

        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" });
        }

        res.status(200).json(purchase);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch purchase",
            error: error.message
        });
    }
};
