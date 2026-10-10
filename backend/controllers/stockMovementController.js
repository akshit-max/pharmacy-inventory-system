const stockMovement = require("../models/stockMovement");

exports.getStockMovements = async (req, res) => {
    try {
        const movements=await stockMovement.find()
            .populate("medicine","name")
            .populate(
                "batch",
                "batchNumber expiryDate"
            )
            .populate("performedBy", "name")
            .sort({createdAt:-1});

        res.status(200).json(movements);

    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch stockMovements",
            error: error.message,
        });

    }
}