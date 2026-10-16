const Sale = require("../models/sale");
const Medicine = require("../models/medicine");
const Batch = require("../models/batch");
const StockMovement = require("../models/stockMovement");

// POST /api/sales
// Step 1: check every item has enough unexpired stock.
// Step 2: take stock from the batches that expire first (FEFO).
// Step 3: save the sale and the audit trail.
// Because all checks happen first, a failed sale never changes the stock.
exports.createSale = async (req, res) => {
    try {
        const { customerName, customerPhone, items } = req.body;
        const invoiceNumber = req.body.invoiceNumber || `SALE-${Date.now()}`;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Add at least one medicine to the sale" });
        }

        const invoiceExists = await Sale.findOne({ invoiceNumber });
        if (invoiceExists) {
            return res.status(400).json({ message: `Invoice number ${invoiceNumber} already exists` });
        }

        // If the same medicine appears twice, add the quantities together
        const quantityByMedicine = {};
        for (const item of items) {
            const quantity = Number(item.quantity);
            if (!item.medicine || !Number.isInteger(quantity) || quantity <= 0) {
                return res.status(400).json({ message: "Each item needs a medicine and a whole-number quantity above 0" });
            }
            quantityByMedicine[item.medicine] = (quantityByMedicine[item.medicine] || 0) + quantity;
        }

        // ---- Step 1: check stock for every medicine ----
        const plan = []; // { medicine, batches, quantity }
        for (const medicineId of Object.keys(quantityByMedicine)) {
            const medicine = await Medicine.findById(medicineId).catch(() => null);
            if (!medicine) {
                return res.status(400).json({ message: "One of the selected medicines was not found" });
            }

            // Only unexpired batches with stock, earliest expiry first
            const batches = await Batch.find({
                medicine: medicineId,
                quantity: { $gt: 0 },
                expiryDate: { $gt: new Date() }
            }).sort({ expiryDate: 1 });

            const available = batches.reduce((total, batch) => total + batch.quantity, 0);
            const wanted = quantityByMedicine[medicineId];
            if (available < wanted) {
                return res.status(400).json({
                    message: `Insufficient stock for ${medicine.name}. Available: ${available}`
                });
            }

            plan.push({ medicine, batches, quantity: wanted });
        }

        // ---- Step 2: deduct stock batch by batch ----
        const saleItems = [];
        const movements = [];
        for (const { medicine, batches, quantity } of plan) {
            let remaining = quantity;

            for (const batch of batches) {
                if (remaining <= 0) break;

                const takeFromBatch = Math.min(batch.quantity, remaining);
                batch.quantity -= takeFromBatch;
                await batch.save();

                saleItems.push({
                    medicine: medicine._id,
                    batch: batch._id,
                    quantity: takeFromBatch,
                    sellingPrice: batch.sellingPrice,
                    total: takeFromBatch * batch.sellingPrice
                });

                movements.push({
                    medicine: medicine._id,
                    batch: batch._id,
                    type: "SALE",
                    quantity: -takeFromBatch,
                    note: `Sale invoice ${invoiceNumber}`,
                    performedBy: req.user ? req.user.id : undefined
                });

                remaining -= takeFromBatch;
            }
        }

        // ---- Step 3: save sale and audit trail ----
        const totalAmount = saleItems.reduce((total, item) => total + item.total, 0);

        const sale = await Sale.create({
            invoiceNumber,
            customerName,
            customerPhone,
            items: saleItems,
            totalAmount
        });

        for (const movement of movements) {
            movement.referenceId = sale._id;
            await StockMovement.create(movement);
        }

        await sale.populate("items.medicine", "name genericName");
        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ message: "Failed to create sale", error: error.message });
    }
};

// GET /api/sales — list all sales, newest first, with medicine names populated
exports.getSales = async (req, res) => {
    try {
        const sales = await Sale.find()
            .populate("items.medicine", "name genericName")
            .sort({ saleDate: -1 });
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch sales", error: error.message });
    }
};

// GET /api/sales/:id — single sale detail with full item breakdown
exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate("items.medicine", "name genericName");
        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }
        res.status(200).json(sale);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid sale id" });
        }
        res.status(500).json({ message: "Failed to fetch sale", error: error.message });
    }
};
