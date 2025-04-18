
import express from "express";
import { getSignUpPage, getLoginPage, postSignUp, postLogin, verifyOTP, resendOTP, logout } from "../../controllers/authController.js";

const router = express.Router();

// Existing routes
router.get("/login", getLoginPage);
router.post("/login", postLogin);
router.get("/signup", getSignUpPage);
router.post("/signup", postSignUp);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Add logout route
router.get('/logout', logout);
router.get('/home', (req, res) => {
    res.render('user/home'); // Assuming you're using EJS or another templating engine
  });
export default router;