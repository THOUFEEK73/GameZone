import express from "express";
import { getSignUpPage, getLoginPage, postSignUp, postLogin, verifyOTP, resendOTP } from "../controllers/authController.js";
 
const router = express.Router();



// Authentication middleWare

 const isAuthenticated = (req,res,next)=>{
  if(!req.session.userId){
    return res.redirect('/login')
  }
  next();
}


router.get("/login", getLoginPage);
router.post("/login", postLogin);
router.get("/signup", getSignUpPage);
router.post("/signup", postSignUp);
router.post('/verify-otp',verifyOTP)

// Add resend OTP route
router.post('/resend-otp', resendOTP);


router.get('/home',isAuthenticated,(req,res)=>{
  res.render('user/home',{
    userId:req.session.userId,
    user:req.session
  })
})

export default router;
