const { describe, it } = require("node:test");
const assert = require("node:assert");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

describe("1. Password Security & Authentication", () => {
    it("hashes password with salt and compares successfully", async () => {
        const plainPassword = "SecurePassword123";
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(plainPassword, salt);

        assert.notStrictEqual(hash, plainPassword);
        const isMatch = await bcrypt.compare(plainPassword, hash);
        assert.strictEqual(isMatch, true);

        const isWrongMatch = await bcrypt.compare("WrongPassword", hash);
        assert.strictEqual(isWrongMatch, false);
    });

    it("signs and verifies JWT token with role payload", () => {
        const secret = "test_jwt_secret_key_12345";
        const userPayload = { id: "user_001", role: "Pharmacist", name: "Dr. Sharma" };

        const token = jwt.sign(userPayload, secret, { expiresIn: "1h" });
        assert.ok(typeof token === "string" && token.length > 20);

        const decoded = jwt.verify(token, secret);
        assert.strictEqual(decoded.id, userPayload.id);
        assert.strictEqual(decoded.role, userPayload.role);
        assert.strictEqual(decoded.name, userPayload.name);
    });
});

describe("2. FEFO (First-Expired, First-Out) Allocation Logic", () => {
    it("sorts batches chronologically by expiry date so earliest-expiry is consumed first", () => {
        const now = new Date();
        const batchA = { batchNumber: "B001", expiryDate: new Date(now.getTime() + 90 * 86400000), quantity: 50 }; // 90 days
        const batchB = { batchNumber: "B002", expiryDate: new Date(now.getTime() + 15 * 86400000), quantity: 30 }; // 15 days
        const batchC = { batchNumber: "B003", expiryDate: new Date(now.getTime() + 45 * 86400000), quantity: 20 }; // 45 days

        const batches = [batchA, batchB, batchC];
        batches.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

        assert.strictEqual(batches[0].batchNumber, "B002"); // Earliest (15 days)
        assert.strictEqual(batches[1].batchNumber, "B003"); // Middle (45 days)
        assert.strictEqual(batches[2].batchNumber, "B001"); // Latest (90 days)
    });

    it("correctly calculates batch deduction without exceeding available stock", () => {
        const batches = [
            { batchNumber: "BATCH-1", quantity: 10, sellingPrice: 50 },
            { batchNumber: "BATCH-2", quantity: 20, sellingPrice: 55 },
        ];

        let requestedQuantity = 15;
        const deductions = [];

        for (const batch of batches) {
            if (requestedQuantity <= 0) break;
            const take = Math.min(batch.quantity, requestedQuantity);
            deductions.push({
                batchNumber: batch.batchNumber,
                deducted: take,
                total: take * batch.sellingPrice,
            });
            requestedQuantity -= take;
        }

        assert.strictEqual(deductions.length, 2);
        assert.strictEqual(deductions[0].deducted, 10);
        assert.strictEqual(deductions[1].deducted, 5);
        assert.strictEqual(requestedQuantity, 0);

        const totalInvoice = deductions.reduce((sum, item) => sum + item.total, 0);
        // (10 * 50) + (5 * 55) = 500 + 275 = 775
        assert.strictEqual(totalInvoice, 775);
    });
});

describe("3. Smart Reorder & Forecasting Math", () => {
    it("computes reorder point and suggested quantity correctly", () => {
        const totalSold30Days = 150;
        const historyDays = 30;
        const targetDays = 30;
        const supplierLeadTime = 5;
        const safetyStock = 20;
        const currentStock = 35;

        // Average daily demand: 150 / 30 = 5 units/day
        const avgDailyDemand = totalSold30Days / historyDays;
        assert.strictEqual(avgDailyDemand, 5);

        // Reorder point: (5 * 5) + 20 = 45 units
        const reorderPoint = Math.ceil((avgDailyDemand * supplierLeadTime) + safetyStock);
        assert.strictEqual(reorderPoint, 45);

        // Current stock (35) <= reorderPoint (45) -> needs reorder!
        const needsReorder = currentStock <= reorderPoint;
        assert.strictEqual(needsReorder, true);

        // Target stock: (5 * 30) + 20 = 170 units
        const targetStock = Math.ceil((avgDailyDemand * targetDays) + safetyStock);
        assert.strictEqual(targetStock, 170);

        // Suggested reorder: 170 - 35 = 135 units
        const suggestedReorder = Math.max(0, targetStock - currentStock);
        assert.strictEqual(suggestedReorder, 135);
    });
});

describe("4. Expiry Risk Tier Classification", () => {
    it("categorizes batches into Expired, Critical, High Risk, and Safe tiers", () => {
        const now = new Date();

        const classifyExpiry = (expiryDate) => {
            const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays <= 0) return "Expired";
            if (diffDays <= 7) return "Critical";
            if (diffDays <= 30) return "High Risk";
            if (diffDays <= 90) return "Upcoming";
            return "Safe";
        };

        const pastDate = new Date(now.getTime() - 2 * 86400000);
        const threeDaysDate = new Date(now.getTime() + 3 * 86400000);
        const twentyDaysDate = new Date(now.getTime() + 20 * 86400000);
        const oneYearDate = new Date(now.getTime() + 365 * 86400000);

        assert.strictEqual(classifyExpiry(pastDate), "Expired");
        assert.strictEqual(classifyExpiry(threeDaysDate), "Critical");
        assert.strictEqual(classifyExpiry(twentyDaysDate), "High Risk");
        assert.strictEqual(classifyExpiry(oneYearDate), "Safe");
    });
});

describe("5. Role-Based Access Control Gates", () => {
    it("authorizes only permitted roles", () => {
        const allowedForPurchases = ["Admin"];
        const allowedForMedicines = ["Admin", "Pharmacist"];
        const allowedForSales = ["Admin", "Pharmacist", "Cashier"];

        const canPerform = (userRole, allowedRoles) => allowedRoles.includes(userRole);

        // Cashier checks
        assert.strictEqual(canPerform("Cashier", allowedForSales), true);
        assert.strictEqual(canPerform("Cashier", allowedForMedicines), false);
        assert.strictEqual(canPerform("Cashier", allowedForPurchases), false);

        // Pharmacist checks
        assert.strictEqual(canPerform("Pharmacist", allowedForSales), true);
        assert.strictEqual(canPerform("Pharmacist", allowedForMedicines), true);
        assert.strictEqual(canPerform("Pharmacist", allowedForPurchases), false);

        // Admin checks
        assert.strictEqual(canPerform("Admin", allowedForSales), true);
        assert.strictEqual(canPerform("Admin", allowedForMedicines), true);
        assert.strictEqual(canPerform("Admin", allowedForPurchases), true);
    });
});

