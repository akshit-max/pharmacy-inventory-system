const mongoose = require("mongoose");

const Sale = require("../models/sale");
const Medicine = require("../models/medicine");
const Batch = require("../models/batch");
const StockMovement = require("../models/stockMovement");

exports.createSale = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const { invoiceNumber, customerName, customerPhone, items } = req.body;

        if (!invoiceNumber || !Array.isArray(items) || items.length === 0) {
            throw new Error("invoiceNumber and at least one sale item are required");
        }

        session.startTransaction();
        const saleItems = [];

        for (const item of items) {
            if (!item.medicine || !Number.isFinite(item.quantity) || item.quantity <= 0) {
                throw new Error("Each item must include a medicine ID and a positive quantity");
            }

            const medicine = await Medicine.findById(item.medicine).session(session);

            if (!medicine) {
                throw new Error(`Medicine not found: ${item.medicine}`);
            }

            let remainingQuantity = item.quantity;

            // Sell batches that expire first.
            const batches = await Batch.find({
                medicine: item.medicine,
                quantity: { $gt: 0 },
                expiryDate: { $gt: new Date() }
            })
                .sort({ expiryDate: 1 })
                .session(session);

            const availableQuantity = batches.reduce(
                (total, batch) => total + batch.quantity,
                0
            );

            if (availableQuantity < item.quantity) {
                throw new Error(
                    `Insufficient stock for ${medicine.name}. Available: ${availableQuantity}`
                );
            }

            for (const batch of batches) {
                if (remainingQuantity <= 0) break;

                const quantityToSell = Math.min(batch.quantity, remainingQuantity);
                const itemTotal = quantityToSell * batch.sellingPrice;

                batch.quantity -= quantityToSell;
                await batch.save({ session });

                saleItems.push({
                    medicine: medicine._id,
                    batch: batch._id,
                    quantity: quantityToSell,
                    sellingPrice: batch.sellingPrice,
                    total: itemTotal
                });

                await StockMovement.create(
                    [{
                        medicine: medicine._id,
                        batch: batch._id,
                        type: "SALE",
                        quantity: -quantityToSell,
                        note: `Sale invoice ${invoiceNumber}`,
                        performedBy: req.user ? req.user.id : undefined
                    }],
                    { session }
                );

                remainingQuantity -= quantityToSell;
            }
        }

        const totalAmount = saleItems.reduce((total, item) => total + item.total, 0);

        const [sale] = await Sale.create(
            [{
                invoiceNumber,
                customerName,
                customerPhone,
                items: saleItems,
                totalAmount
            }],
            { session }
        );

        await session.commitTransaction();
        res.status(201).json(sale);
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        await session.endSession();
    }
};
