import express from "express";
import { getSignUpPage, getLoginPage, postSignUp, postLogin, verifyOTP } from "../controllers/authController.js";
 
const router = express.Router();

router.get("/login", getLoginPage);
router.get("/signup", getSignUpPage);


router.get('/home', (req, res) => {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    // Use res.render instead of res.sendFile
    res.render('/home', { 
      userId: req.session.userId 
      // You can pass any other data you want to display in the template
    });
  });

router.post("/signup", postSignUp);
router.post("/login", postLogin);
router.post('/verify-otp',verifyOTP)

export default router;
