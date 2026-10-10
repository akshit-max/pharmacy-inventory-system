const mongoose=require('mongoose');


const stockMovementSchema=new mongoose.Schema({
    medicine:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        required: true,
    },
    batch:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
    },
    type:{
        type: String,
        enum: [
            "PURCHASE",
            "SALE",
            "ADJUSMENT"
        ],
        required: true,
    },
    quantity:{
        type: Number,
        required: true,
    },
    refernceId:{
        type: mongoose.Schema.Types.ObjectId,
    },
    note:{
        type: String,
        trim: true,
    },
    performedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{
    timestamps: true
}
);

module.exports= mongoose.model("stockMovement",stockMovementSchema);