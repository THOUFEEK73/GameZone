
import express from "express";
import { getSignUpPage, getLoginPage, postSignUp, postLogin, verifyOTP, resendOTP, logout } from "../../controllers/authController.js";
import  isAthenticated  from "../../middleware/auth.js"
const router = express.Router();

// Existing routes
router.get("/login", getLoginPage);
router.post("/login", postLogin);
router.get("/signup", getSignUpPage);
router.post("/signup", postSignUp);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Add logout route
router.get('/logout',isAthenticated, logout);
router.get('/home',isAthenticated, (req, res) => {
    res.render('user/home'); // Assuming you're using EJS or another templating engine
  });
export default router;