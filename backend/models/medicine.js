const mongoose=require("mongoose");

const medicineSchema=new mongoose.Schema({
    name:{
        type: String,
        required: [true,"medicine name is required"],
        trim: true,
        minLength: [2,"Minimum lenght of medicine should be 2"]
    },
    genericName:{
        type: String,
        required: [true,"Generic name is required"],
        trim: true,
    },
    category:{
        type: String,
        required:  [true,"Category name is required"],
    },
    manufacturer:{
        type: String,
        required:  [true,"Manufacturer name is required"],
    },
    unit:{
        type: String,
        required:  [true,"Unitis required"],
    },
    reorderLevel:{
        type: Number,
        default: 10,
        min: [0,"Reorder level is required"]
    },
    supplierLeadTime: {
        type: Number,
        default: 5,
        min: [0, "Supplier lead time cannot be negative"]
    },
    safetyStock: {
        type: Number,
        default: 20,
        min: [0, "Safety stock cannot be negative"]
    },
    prescriptionRequired:{
        type: Boolean,
        default: false,
    },
},{
    timestamps:true,
});

module.exports=mongoose.model("Medicine",medicineSchema);