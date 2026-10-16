const Purchase = require("../models/purchase");
const Supplier = require("../models/supplier");
const Medicine = require("../models/medicine");
const Batch = require("../models/batch");
const StockMovement = require("../models/stockMovement");

// POST /api/purchase
// Step 1: validate everything. Step 2: save purchase. Step 3: add stock to batches.
// Because all checks happen first, a bad request never changes the stock.
exports.createPurchase = async (req, res) => {
    try {
        const { supplier, invoiceNumber, purchaseDate, items } = req.body;

        // ---- Step 1: validation ----
        if (!supplier || !invoiceNumber || !purchaseDate || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Supplier, invoice number, purchase date and at least one item are required" });
        }

        const supplierExists = await Supplier.findById(supplier).catch(() => null);
        if (!supplierExists) {
            return res.status(400).json({ message: "Supplier not found" });
        }

        const invoiceExists = await Purchase.findOne({ invoiceNumber: invoiceNumber.trim() });
        if (invoiceExists) {
            return res.status(400).json({ message: `Invoice number ${invoiceNumber} already exists` });
        }

        const cleanItems = [];
        for (const item of items) {
            const medicineExists = await Medicine.findById(item.medicine).catch(() => null);
            if (!medicineExists) {
                return res.status(400).json({ message: "One of the selected medicines was not found" });
            }

            const quantity = Number(item.quantity);
            const purchasePrice = Number(item.purchasePrice);
            const sellingPrice = Number(item.sellingPrice);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                return res.status(400).json({ message: `Quantity for ${medicineExists.name} must be a whole number above 0` });
            }
            if (!(purchasePrice >= 0) || !(sellingPrice >= 0)) {
                return res.status(400).json({ message: `Prices for ${medicineExists.name} must be 0 or more` });
            }
            if (!item.batchNumber || !item.expiryDate || isNaN(new Date(item.expiryDate))) {
                return res.status(400).json({ message: `Batch number and a valid expiry date are required for ${medicineExists.name}` });
            }

            cleanItems.push({
                medicine: item.medicine,
                batchNumber: item.batchNumber.trim(),
                expiryDate: item.expiryDate,
                quantity,
                purchasePrice,
                sellingPrice
            });
        }

        const totalAmount = cleanItems.reduce((total, item) => total + item.quantity * item.purchasePrice, 0);

        // ---- Step 2: save the purchase ----
        const purchase = await Purchase.create({
            supplier,
            invoiceNumber: invoiceNumber.trim(),
            purchaseDate,
            items: cleanItems,
            totalAmount
        });

        // ---- Step 3: add stock and write the audit trail ----
        for (const item of cleanItems) {
            let batch = await Batch.findOne({
                medicine: item.medicine,
                batchNumber: item.batchNumber
            });

            if (batch) {
                // Same batch bought again: increase stock and use the latest prices
                batch.quantity += item.quantity;
                batch.purchasePrice = item.purchasePrice;
                batch.sellingPrice = item.sellingPrice;
                await batch.save();
            } else {
                batch = await Batch.create({
                    medicine: item.medicine,
                    batchNumber: item.batchNumber,
                    expiryDate: item.expiryDate,
                    purchasePrice: item.purchasePrice,
                    sellingPrice: item.sellingPrice,
                    quantity: item.quantity
                });
            }

            await StockMovement.create({
                medicine: item.medicine,
                batch: batch._id,
                type: "PURCHASE",
                quantity: item.quantity,
                referenceId: purchase._id,
                note: `Purchase invoice ${purchase.invoiceNumber}`,
                performedBy: req.user ? req.user.id : undefined
            });
        }

        res.status(201).json(purchase);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create purchase",
            error: error.message
        });
    }
};

// GET /api/purchase
exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .populate("supplier", "name phone")
            .populate("items.medicine", "name genericName")
            .sort({ purchaseDate: -1, createdAt: -1 });

        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch purchases",
            error: error.message
        });
    }
};

// GET /api/purchase/:id
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
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid purchase id" });
        }
        res.status(500).json({
            message: "Failed to fetch purchase",
            error: error.message
        });
    }
};
