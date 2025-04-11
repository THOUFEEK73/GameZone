import mongoose from "mongoose";

mongoose.connect(process.env.MONOG_URI,{useNewUrlParser:true,useUnifieldTopolgy:true})
.then(()=>console.log("Database Conneted"))
.catch((err)=>console.log('Database connection failed',err));