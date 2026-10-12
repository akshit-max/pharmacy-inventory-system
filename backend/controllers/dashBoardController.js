const Medicine= require("../models/medicine");
const Batch = require("../models/batch");
const Sale = require("../models/sale");
const Purchase = require("../models/purchase");

exports.getDashBoardStats = async (req,res)=>{
    try{
        const now = new Date();

    // Start of today
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Start of tomorrow
    const startOfTomorrow = new Date(startOfDay);
    startOfTomorrow.setDate(
      startOfTomorrow.getDate() + 1
    );

    // Expiry threshold: next 30 days
    const expiryThreshold = new Date(now);
    expiryThreshold.setDate(
      expiryThreshold.getDate() + 30
    );

    // Basic counts
    const medicines = await Medicine.find().select("name reorderLevel");
    const totalMedicines = medicines.length;

    const totalBatches = await Batch.countDocuments();

    // Stock and batch status
    const batches = await Batch.find()
      .populate("medicine", "name reorderLevel");

    let totalStockUnits = 0;
    let lowStockMedicines = 0;
    let expiredBatches = 0;
    let expiringSoonBatches = 0;

    const stockByMedicine = new Map();
    for (const batch of batches) {
      const medicine = batch.medicine;

      if (!medicine) continue;

      totalStockUnits += batch.quantity;
      const medicineId = medicine._id.toString();
      const currentStock = stockByMedicine.get(medicineId) || {
        quantity: 0,
        reorderLevel: medicine.reorderLevel ?? 10
      };
      currentStock.quantity += batch.quantity;
      stockByMedicine.set(medicineId, currentStock);

      if (batch.expiryDate < now && batch.quantity > 0) {
        expiredBatches++;
      } else if (
        batch.expiryDate >= now &&
        batch.expiryDate <= expiryThreshold &&
        batch.quantity > 0
      ) {
        expiringSoonBatches++;
      }
    }

    // Check every medicine, including those that have no batch records.
    // Their stock defaults to zero and therefore counts as low stock.
    lowStockMedicines = medicines.filter((medicine) => {
      const stock = stockByMedicine.get(medicine._id.toString());
      return (stock?.quantity ?? 0) <= (medicine.reorderLevel ?? 10);
    }).length;

    // Today's sales
    const todaySales = await Sale.find({
      saleDate: {
        $gte: startOfDay,
        $lt: startOfTomorrow
      }
    });

    const salesToday = todaySales.length;

    const revenueToday = todaySales.reduce(
      (total, sale) => total + sale.totalAmount,
      0
    );

    // Recent activity
    const recentSales = await Sale.find()
      .populate("items.medicine", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPurchases = await Purchase.find()
      .populate("supplier", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      summary: {
        totalMedicines,
        totalBatches,
        totalStockUnits,
        lowStockMedicines,
        expiredBatches,
        expiringSoonBatches,
        salesToday,
        revenueToday
      },
      recentSales,
      recentPurchases
    });
    }
    catch(error){
        res.status(500).json({
            message: "Failed to fetch dashboard data",
            error: error.message
        });
    }
}
