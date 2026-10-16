const Medicine = require("../models/medicine");
const Batch = require("../models/batch");
const Sale = require("../models/sale");

exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const medicines = await Medicine.find().select("reorderLevel");
        const totalMedicines = medicines.length;

        const batches = await Batch.find();

        let eligibleInventory = 0;
        let lowStockAlerts = 0;
        let expiredBatches = 0;
        let expiringSoon = 0;

        const now = new Date();
        const next30Days = new Date();
        next30Days.setDate(next30Days.getDate() + 30);

        // Total unexpired stock for each medicine (medicineId -> quantity)
        const medicineStock = {};

        batches.forEach(batch => {
            if (batch.quantity <= 0) return; // empty batches don't matter

            const expiry = new Date(batch.expiryDate);
            if (expiry <= now) {
                expiredBatches++;
                return;
            }

            eligibleInventory += batch.quantity;
            if (expiry <= next30Days) {
                expiringSoon++;
            }

            const medId = batch.medicine.toString();
            medicineStock[medId] = (medicineStock[medId] || 0) + batch.quantity;
        });

        // A medicine is low on stock when its total unexpired stock is at or
        // below its reorder level. Medicines with no batches count as 0 stock.
        medicines.forEach(med => {
            const stock = medicineStock[med._id.toString()] || 0;
            if (stock <= (med.reorderLevel ?? 10)) {
                lowStockAlerts++;
            }
        });

        // Fetch today's sales
        const salesToday = await Sale.find({
            saleDate: { $gte: today }
        });

        const todaySalesAmount = salesToday.reduce((total, sale) => total + sale.totalAmount, 0);
        const todayTransactions = salesToday.length;

        res.status(200).json({
            totalMedicines,
            eligibleInventory,
            lowStockAlerts,
            expiredBatches,
            expiringSoon,
            todaySalesAmount,
            todayTransactions
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch dashboard stats",
            error: error.message
        });
    }
};

exports.getReorderRecommendations = async (req, res) => {
    try {
        const targetDays = 30; // Target coverage period
        const historyDays = 30; // Historical window
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - historyDays);
        const now = new Date();

        // 1. Fetch all medicines
        const medicines = await Medicine.find().lean();

        // 2. Aggregate 30-day sales per medicine
        const salesData = await Sale.aggregate([
            { $match: { saleDate: { $gte: thirtyDaysAgo } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.medicine",
                    totalSold: { $sum: "$items.quantity" }
                }
            }
        ]);

        const salesMap = {};
        salesData.forEach(s => {
            salesMap[s._id.toString()] = s.totalSold;
        });

        // 3. Aggregate unexpired stock per medicine
        const stockData = await Batch.aggregate([
            { $match: { expiryDate: { $gt: now }, quantity: { $gt: 0 } } },
            {
                $group: {
                    _id: "$medicine",
                    eligibleStock: { $sum: "$quantity" }
                }
            }
        ]);

        const stockMap = {};
        stockData.forEach(s => {
            stockMap[s._id.toString()] = s.eligibleStock;
        });

        // 4. Calculate recommendations
        const recommendations = medicines.map(med => {
            const medId = med._id.toString();
            const totalSold = salesMap[medId] || 0;
            const currentStock = stockMap[medId] || 0;
            const leadTime = med.supplierLeadTime !== undefined ? med.supplierLeadTime : 5;
            const safetyStock = med.safetyStock !== undefined ? med.safetyStock : 20;

            let add = 0;
            let estDaysRemaining = null;
            let reorderPoint = med.reorderLevel || 10;
            let suggestedReorderQuantity = 0;
            let targetStock = 0;
            let status = "Insufficient Sales History";

            if (totalSold > 0) {
                add = totalSold / historyDays;
                estDaysRemaining = currentStock / add;
                reorderPoint = Math.ceil((add * leadTime) + safetyStock);
                targetStock = Math.ceil((add * targetDays) + safetyStock);
                
                suggestedReorderQuantity = Math.max(0, targetStock - currentStock);

                if (currentStock <= reorderPoint) {
                    status = "Reorder Now";
                } else if (estDaysRemaining <= (leadTime + 3)) { // 3 days buffer
                    status = "Reorder Soon";
                } else {
                    status = "Stock Sufficient";
                }
            } else {
                if (currentStock <= reorderPoint) {
                    status = "Reorder Now (Static)";
                    suggestedReorderQuantity = Math.max(0, safetyStock - currentStock);
                } else {
                    status = "Stock Sufficient";
                }
            }

            return {
                medicineId: med._id,
                medicineName: med.name,
                genericName: med.genericName,
                currentStock: currentStock,
                averageDailyDemand: add > 0 ? parseFloat(add.toFixed(2)) : 0,
                estimatedDaysRemaining: estDaysRemaining !== null ? parseFloat(estDaysRemaining.toFixed(1)) : "N/A",
                reorderPoint,
                suggestedReorderQuantity,
                supplierLeadTime: leadTime,
                status
            };
        });

        const statusPriority = {
            "Reorder Now": 1,
            "Reorder Now (Static)": 2,
            "Reorder Soon": 3,
            "Insufficient Sales History": 4,
            "Stock Sufficient": 5
        };

        recommendations.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

        res.status(200).json(recommendations);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch reorder recommendations",
            error: error.message
        });
    }
};

exports.getExpiryRisks = async (req, res) => {
    try {
        const now = new Date();
        const next7Days = new Date(now);
        next7Days.setDate(now.getDate() + 7);
        
        const next30Days = new Date(now);
        next30Days.setDate(now.getDate() + 30);
        
        const next90Days = new Date(now);
        next90Days.setDate(now.getDate() + 90);

        // Fetch all batches with quantity > 0
        const batches = await Batch.find({ quantity: { $gt: 0 } })
            .populate("medicine", "name genericName")
            .lean();

        let expiredCount = 0;
        let criticalCount = 0;
        let highRiskCount = 0;
        let totalAtRiskQuantity = 0; // Excludes Safe and Upcoming for "urgent" at risk, or just everything up to 30 days? "Total positive stock quantity in expired or at-risk batches" - I'll count Expired, Critical, High Risk

        const risks = batches.map(batch => {
            const expiry = new Date(batch.expiryDate);
            const diffTime = expiry.getTime() - now.getTime();
            const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let category = "Safe";
            let sortPriority = 5;

            if (expiry <= now) {
                category = "Expired";
                sortPriority = 1;
                expiredCount++;
                totalAtRiskQuantity += batch.quantity;
            } else if (expiry <= next7Days) {
                category = "Critical";
                sortPriority = 2;
                criticalCount++;
                totalAtRiskQuantity += batch.quantity;
            } else if (expiry <= next30Days) {
                category = "High Risk";
                sortPriority = 3;
                highRiskCount++;
                totalAtRiskQuantity += batch.quantity;
            } else if (expiry <= next90Days) {
                category = "Upcoming";
                sortPriority = 4;
            }

            const estimatedValue = (batch.purchasePrice && batch.purchasePrice > 0) 
                ? batch.quantity * batch.purchasePrice 
                : 0;

            return {
                batchId: batch._id,
                batchNumber: batch.batchNumber,
                medicineName: batch.medicine ? batch.medicine.name : "Unknown",
                genericName: batch.medicine ? batch.medicine.genericName : "",
                expiryDate: batch.expiryDate,
                daysRemaining: category === "Expired" ? 0 : daysRemaining,
                quantity: batch.quantity,
                category,
                sortPriority,
                estimatedValue,
                hasReliableValue: (batch.purchasePrice && batch.purchasePrice > 0) ? true : false
            };
        });

        risks.sort((a, b) => {
            if (a.sortPriority !== b.sortPriority) {
                return a.sortPriority - b.sortPriority;
            }
            return a.daysRemaining - b.daysRemaining;
        });

        res.status(200).json({
            summary: {
                expiredCount,
                criticalCount,
                highRiskCount,
                totalAtRiskQuantity
            },
            details: risks
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch expiry risks",
            error: error.message
        });
    }
};
