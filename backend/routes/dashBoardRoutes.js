const express=require("express")

const{
    getDashBoardStats
}=require("../controllers/dashBoardController");

const router=express.Router();

router.get("/",getDashBoardStats);

module.exports=router;