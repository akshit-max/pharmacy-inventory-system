const express = require("express");
const cors = require ("cors");
require("dotenv").config();



const app=express();
const connectDB=require("./config/db");

const medicineRoutes=require("./routes/medicineRoutes");
const batchRoutes=require("./routes/batchRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes")
const stockMovementRoutes = require("./routes/stockMovementRoutes")
const saleRoutes = require("./routes/saleRoutes")
const analyticsRoutes = require("./routes/analyticsRoutes");
const authRoutes = require("./routes/authRoutes");
const dashBoardRoutes = require("./routes/dashBoardRoutes");

app.use(express.json());
app.use(cors());

connectDB();

app.get("/",(req,res)=>{
    res.json({
        message: "Pharmacy Management API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/medicines",medicineRoutes)
app.use("/api/batches",batchRoutes)
app.use("/api/suppliers",supplierRoutes);
app.use("/api/purchase",purchaseRoutes);
app.use("/api/inventory",inventoryRoutes);
app.use("/api/stockMovements",stockMovementRoutes);
app.use("/api/sales",saleRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashBoard", dashBoardRoutes);
app.use("/api/dashboard", dashBoardRoutes);

// Any unknown /api route gets a clear JSON message instead of an HTML page
app.use("/api", (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Bad JSON in a request body, or any unexpected error
app.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Invalid JSON in request body" });
    }
    console.error(err);
    res.status(500).json({ message: "Something went wrong on the server" });
});


const PORT= process.env.PORT || 5000 ;
app.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);
});