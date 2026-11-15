require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/user");
const Supplier = require("../models/supplier");
const Medicine = require("../models/medicine");
const Batch = require("../models/batch");
const Purchase = require("../models/purchase");
const Sale = require("../models/sale");
const StockMovement = require("../models/stockMovement");

async function seed() {
    try {
        console.log("Connecting to database...");
        await connectDB();

        console.log("Clearing old demo data (keeping existing admins if any)...");
        // Clear collections to ensure a fresh, consistent demo environment
        await Supplier.deleteMany({});
        await Medicine.deleteMany({});
        await Batch.deleteMany({});
        await Purchase.deleteMany({});
        await Sale.deleteMany({});
        await StockMovement.deleteMany({});

        // 1. Users
        console.log("Seeding staff accounts...");
        let adminUser = await User.findOne({ email: "admin@pharmasys.com" });
        if (!adminUser) {
            adminUser = await User.create({
                name: "Admin Officer",
                email: "admin@pharmasys.com",
                password: "password123",
                role: "Admin"
            });
            console.log("Created Admin: admin@pharmasys.com / password123");
        } else {
            console.log("Admin account already exists: admin@pharmasys.com");
        }

        let pharmacistUser = await User.findOne({ email: "pharmacist@pharmasys.com" });
        if (!pharmacistUser) {
            pharmacistUser = await User.create({
                name: "Dr. Aarti Sharma",
                email: "pharmacist@pharmasys.com",
                password: "password123",
                role: "Pharmacist"
            });
            console.log("Created Pharmacist: pharmacist@pharmasys.com / password123");
        }

        let cashierUser = await User.findOne({ email: "cashier@pharmasys.com" });
        if (!cashierUser) {
            cashierUser = await User.create({
                name: "Rahul Verma",
                email: "cashier@pharmasys.com",
                password: "password123",
                role: "Cashier"
            });
            console.log("Created Cashier: cashier@pharmasys.com / password123");
        }

        // 2. Suppliers
        console.log("Seeding suppliers...");
        const suppliers = await Supplier.insertMany([
            {
                name: "Sun Pharma Distributors",
                contactPerson: "Rajesh Kumar",
                phone: "+91 98201 12345",
                email: "orders@sunpharma-dist.com",
                address: "Plot 14, MIDC Industrial Area, Andheri East, Mumbai"
            },
            {
                name: "Cipla Healthcare Logistics",
                contactPerson: "Neha Verma",
                phone: "+91 98110 54321",
                email: "supply@cipla-logistics.com",
                address: "Warehouse 4, Okhla Phase 2, New Delhi"
            },
            {
                name: "Dr. Reddy's Direct Supply",
                contactPerson: "Suresh Reddy",
                phone: "+91 98490 67890",
                email: "contact@drreddysupply.com",
                address: "Survey 42, Bachupally, Hyderabad"
            }
        ]);
        const [supSun, supCipla, supReddy] = suppliers;

        // 3. Medicines
        console.log("Seeding master medicines catalog...");
        const medicines = await Medicine.insertMany([
            {
                name: "Dolo 650",
                genericName: "Paracetamol 650mg",
                category: "Analgesic / Antipyretic",
                manufacturer: "Micro Labs",
                unit: "Strip (15 tabs)",
                reorderLevel: 30,
                supplierLeadTime: 3,
                safetyStock: 20,
                prescriptionRequired: false
            },
            {
                name: "Augmentin 625 Duo",
                genericName: "Amoxicillin + Clavulanic Acid (500mg/125mg)",
                category: "Antibiotic",
                manufacturer: "GSK Pharmaceuticals",
                unit: "Strip (10 tabs)",
                reorderLevel: 25,
                supplierLeadTime: 5,
                safetyStock: 15,
                prescriptionRequired: true
            },
            {
                name: "Pan 40",
                genericName: "Pantoprazole 40mg",
                category: "Antacid / Gastrointestinal",
                manufacturer: "Alkem Laboratories",
                unit: "Strip (15 tabs)",
                reorderLevel: 35,
                supplierLeadTime: 3,
                safetyStock: 25,
                prescriptionRequired: false
            },
            {
                name: "Glycomet GP 1",
                genericName: "Metformin 500mg + Glimepiride 1mg",
                category: "Antidiabetic",
                manufacturer: "USV Ltd",
                unit: "Strip (10 tabs)",
                reorderLevel: 40,
                supplierLeadTime: 4,
                safetyStock: 30,
                prescriptionRequired: true
            },
            {
                name: "Cetzine 10mg",
                genericName: "Cetirizine Hydrochloride 10mg",
                category: "Antihistamine",
                manufacturer: "Dr. Reddy's Laboratories",
                unit: "Strip (10 tabs)",
                reorderLevel: 20,
                supplierLeadTime: 2,
                safetyStock: 15,
                prescriptionRequired: false
            },
            {
                name: "Azithral 500",
                genericName: "Azithromycin 500mg",
                category: "Antibiotic",
                manufacturer: "Alembic Pharmaceuticals",
                unit: "Strip (5 tabs)",
                reorderLevel: 20,
                supplierLeadTime: 5,
                safetyStock: 10,
                prescriptionRequired: true
            },
            {
                name: "Atorva 10",
                genericName: "Atorvastatin 10mg",
                category: "Cardiovascular / Lipid Lowering",
                manufacturer: "Zydus Healthcare",
                unit: "Strip (15 tabs)",
                reorderLevel: 30,
                supplierLeadTime: 4,
                safetyStock: 20,
                prescriptionRequired: true
            },
            {
                name: "Calcirol 60K",
                genericName: "Cholecalciferol Vitamin D3 60,000 IU",
                category: "Supplements & Vitamins",
                manufacturer: "Cadila Pharmaceuticals",
                unit: "Sachet (1g)",
                reorderLevel: 15,
                supplierLeadTime: 2,
                safetyStock: 10,
                prescriptionRequired: false
            }
        ]);

        const [medDolo, medAugmentin, medPan, medGlyco, medCetzine, medAzithral, medAtorva, medCalcirol] = medicines;

        // 4. Batches with distinct expiry horizons
        console.log("Seeding inventory batches (Safe, High Risk, Critical, Expired, and Low Stock)...");
        const now = new Date();
        const daysFromNow = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        const batches = await Batch.insertMany([
            // Dolo: safe batch (180 days) + high-risk batch (18 days)
            {
                medicine: medDolo._id,
                batchNumber: "DL-2601",
                expiryDate: daysFromNow(180),
                purchasePrice: 22.0,
                sellingPrice: 33.0,
                quantity: 110
            },
            {
                medicine: medDolo._id,
                batchNumber: "DL-2599",
                expiryDate: daysFromNow(18), // High Risk (<30 days)
                purchasePrice: 20.0,
                sellingPrice: 30.0,
                quantity: 15
            },
            // Augmentin: Critical (<7 days) + Safe (365 days)
            {
                medicine: medAugmentin._id,
                batchNumber: "AUG-771",
                expiryDate: daysFromNow(4), // Critical (<7 days)
                purchasePrice: 140.0,
                sellingPrice: 210.0,
                quantity: 8
            },
            {
                medicine: medAugmentin._id,
                batchNumber: "AUG-890",
                expiryDate: daysFromNow(365), // Safe
                purchasePrice: 145.0,
                sellingPrice: 215.0,
                quantity: 60
            },
            // Pan 40: Expired batch (-5 days) + Safe batch (240 days)
            {
                medicine: medPan._id,
                batchNumber: "PAN-EXP-01",
                expiryDate: daysFromNow(-5), // Expired!
                purchasePrice: 70.0,
                sellingPrice: 105.0,
                quantity: 12
            },
            {
                medicine: medPan._id,
                batchNumber: "PAN-920",
                expiryDate: daysFromNow(240), // Safe
                purchasePrice: 72.0,
                sellingPrice: 110.0,
                quantity: 85
            },
            // Glycomet: Safe (300 days)
            {
                medicine: medGlyco._id,
                batchNumber: "GLY-301",
                expiryDate: daysFromNow(300),
                purchasePrice: 85.0,
                sellingPrice: 125.0,
                quantity: 75
            },
            // Cetzine: Low stock alert! (Only 6 units left vs reorderLevel 20)
            {
                medicine: medCetzine._id,
                batchNumber: "CTZ-105",
                expiryDate: daysFromNow(210),
                purchasePrice: 25.0,
                sellingPrice: 42.0,
                quantity: 6 // Low Stock!
            },
            // Azithral: Safe (320 days)
            {
                medicine: medAzithral._id,
                batchNumber: "AZ-504",
                expiryDate: daysFromNow(320),
                purchasePrice: 90.0,
                sellingPrice: 135.0,
                quantity: 45
            },
            // Atorva: Safe (270 days)
            {
                medicine: medAtorva._id,
                batchNumber: "ATV-611",
                expiryDate: daysFromNow(270),
                purchasePrice: 110.0,
                sellingPrice: 165.0,
                quantity: 50
            },
            // Calcirol: Safe (150 days)
            {
                medicine: medCalcirol._id,
                batchNumber: "CLC-440",
                expiryDate: daysFromNow(150),
                purchasePrice: 35.0,
                sellingPrice: 55.0,
                quantity: 40
            }
        ]);

        // 5. Purchases
        console.log("Seeding procurement purchases history...");
        const purchase1 = await Purchase.create({
            supplier: supSun._id,
            invoiceNumber: "INV-SUN-2026-081",
            purchaseDate: daysFromNow(-25),
            items: [
                {
                    medicine: medDolo._id,
                    batchNumber: "DL-2601",
                    expiryDate: daysFromNow(180),
                    quantity: 120,
                    purchasePrice: 22.0,
                    sellingPrice: 33.0
                },
                {
                    medicine: medPan._id,
                    batchNumber: "PAN-920",
                    expiryDate: daysFromNow(240),
                    quantity: 90,
                    purchasePrice: 72.0,
                    sellingPrice: 110.0
                }
            ],
            totalAmount: (120 * 22) + (90 * 72)
        });

        const purchase2 = await Purchase.create({
            supplier: supCipla._id,
            invoiceNumber: "INV-CIP-2026-144",
            purchaseDate: daysFromNow(-12),
            items: [
                {
                    medicine: medAugmentin._id,
                    batchNumber: "AUG-890",
                    expiryDate: daysFromNow(365),
                    quantity: 65,
                    purchasePrice: 145.0,
                    sellingPrice: 215.0
                },
                {
                    medicine: medAzithral._id,
                    batchNumber: "AZ-504",
                    expiryDate: daysFromNow(320),
                    quantity: 50,
                    purchasePrice: 90.0,
                    sellingPrice: 135.0
                }
            ],
            totalAmount: (65 * 145) + (50 * 90)
        });

        // 6. Sales (including Today's Sales for live Dashboard metrics)
        console.log("Seeding sales transactions and receipts...");
        const todayDate = new Date();

        const saleToday1 = await Sale.create({
            invoiceNumber: `SALE-${Date.now() - 3600000}`,
            customerName: "Rohan Gupta",
            customerPhone: "+91 98765 43210",
            saleDate: todayDate,
            items: [
                {
                    medicine: medDolo._id,
                    batch: batches[1]._id, // DL-2599
                    quantity: 2,
                    sellingPrice: 30.0,
                    total: 60.0
                },
                {
                    medicine: medCetzine._id,
                    batch: batches[7]._id, // CTZ-105
                    quantity: 1,
                    sellingPrice: 42.0,
                    total: 42.0
                }
            ],
            totalAmount: 102.0
        });

        const saleToday2 = await Sale.create({
            invoiceNumber: `SALE-${Date.now() - 1800000}`,
            customerName: "Pooja Malhotra",
            customerPhone: "+91 99887 76655",
            saleDate: todayDate,
            items: [
                {
                    medicine: medAugmentin._id,
                    batch: batches[2]._id, // AUG-771
                    quantity: 1,
                    sellingPrice: 210.0,
                    total: 210.0
                },
                {
                    medicine: medPan._id,
                    batch: batches[5]._id, // PAN-920
                    quantity: 1,
                    sellingPrice: 110.0,
                    total: 110.0
                }
            ],
            totalAmount: 320.0
        });

        const saleYesterday = await Sale.create({
            invoiceNumber: `SALE-${Date.now() - 86400000}`,
            customerName: "Amit Patel",
            customerPhone: "+91 97123 45678",
            saleDate: daysFromNow(-1),
            items: [
                {
                    medicine: medGlyco._id,
                    batch: batches[6]._id, // GLY-301
                    quantity: 2,
                    sellingPrice: 125.0,
                    total: 250.0
                }
            ],
            totalAmount: 250.0
        });

        const saleThreeDaysAgo = await Sale.create({
            invoiceNumber: `SALE-${Date.now() - 3 * 86400000}`,
            customerName: "Sunita Roy",
            customerPhone: "+91 91234 56789",
            saleDate: daysFromNow(-3),
            items: [
                {
                    medicine: medAtorva._id,
                    batch: batches[9]._id, // ATV-611
                    quantity: 1,
                    sellingPrice: 165.0,
                    total: 165.0
                },
                {
                    medicine: medCalcirol._id,
                    batch: batches[10]._id, // CLC-440
                    quantity: 2,
                    sellingPrice: 55.0,
                    total: 110.0
                }
            ],
            totalAmount: 275.0
        });

        // 7. Audit Trail (Stock Movements)
        console.log("Seeding immutable audit trail movements...");
        await StockMovement.insertMany([
            {
                medicine: medDolo._id,
                batch: batches[0]._id,
                type: "PURCHASE",
                quantity: 120,
                referenceId: purchase1._id,
                note: `Purchase invoice ${purchase1.invoiceNumber}`,
                performedBy: adminUser._id
            },
            {
                medicine: medPan._id,
                batch: batches[5]._id,
                type: "PURCHASE",
                quantity: 90,
                referenceId: purchase1._id,
                note: `Purchase invoice ${purchase1.invoiceNumber}`,
                performedBy: adminUser._id
            },
            {
                medicine: medAugmentin._id,
                batch: batches[3]._id,
                type: "PURCHASE",
                quantity: 65,
                referenceId: purchase2._id,
                note: `Purchase invoice ${purchase2.invoiceNumber}`,
                performedBy: adminUser._id
            },
            {
                medicine: medDolo._id,
                batch: batches[1]._id,
                type: "SALE",
                quantity: -2,
                referenceId: saleToday1._id,
                note: `Sale invoice ${saleToday1.invoiceNumber}`,
                performedBy: cashierUser._id
            },
            {
                medicine: medCetzine._id,
                batch: batches[7]._id,
                type: "SALE",
                quantity: -1,
                referenceId: saleToday1._id,
                note: `Sale invoice ${saleToday1.invoiceNumber}`,
                performedBy: cashierUser._id
            },
            {
                medicine: medAugmentin._id,
                batch: batches[2]._id,
                type: "SALE",
                quantity: -1,
                referenceId: saleToday2._id,
                note: `Sale invoice ${saleToday2.invoiceNumber}`,
                performedBy: cashierUser._id
            },
            {
                medicine: medPan._id,
                batch: batches[5]._id,
                type: "SALE",
                quantity: -1,
                referenceId: saleToday2._id,
                note: `Sale invoice ${saleToday2.invoiceNumber}`,
                performedBy: cashierUser._id
            },
            {
                medicine: medPan._id,
                batch: batches[4]._id,
                type: "ADJUSTMENT",
                quantity: 12,
                note: "Batch expired; quarantined for supplier credit return",
                performedBy: pharmacistUser._id
            }
        ]);

        console.log("\n=======================================================");
        console.log("   DUMMY DATA SEEDING COMPLETED SUCCESSFULLY!");
        console.log("=======================================================");
        console.log("Users available for login (Password: password123):");
        console.log("1. Admin:      admin@pharmasys.com");
        console.log("2. Pharmacist: pharmacist@pharmasys.com");
        console.log("3. Cashier:    cashier@pharmasys.com");
        console.log("=======================================================");

        process.exit(0);
    } catch (err) {
        console.error("Seeding failed with error:", err);
        process.exit(1);
    }
}

seed();

