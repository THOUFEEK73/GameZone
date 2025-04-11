 import { timeStamp } from "console";
import mongoose from "mongoose";

 const userSchema = new mongoose.userSchema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,require:true},

 },{timeStamp:true});


 module.exports  = mongoose.model('user',userSchema)