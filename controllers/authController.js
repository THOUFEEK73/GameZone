import User from "../models/userModel.js";
import dotenv from "dotenv";
import sendEmail from "../utils/mailer.js";
import crypto from "crypto"; // Add this import
import OTP  from "../models/otpModel.js";
import { generateOTP } from "../utils/otp-functions.js";

dotenv.config();

export const getSignUpPage = (req, res) => {
  res.render("user/signup", { err: null });
};

export const getLoginPage = (req, res) => {
  res.render("user/login");
};

export const postSignUp = async (req, res) => {
  try {
    const { name, email, phone, password, confirm_password } = req.body;

    // Validate Require Fields

    if (!name || !email || !phone || !password || !confirm_password) {
      return res.render("/signup", { err: "Please Fill The Empty Field" });
    }

    // Check if User already Exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("user/signup", { err: "User Already Exist" });
    }

    // Store user Data in Session
    req.session.tempUser = { name, phone, email, password };

    //Generate and Send OTP
     
    const otpSent = await generateOTP(email);

    if (!otpSent) {
      return res.render("user/signup", { err: "Failed To Send OTP" });
    }

    res.render("user/verify-otp", { email });
  } catch (error) {
    console.error("Signup error", error);
    res.render("user/signup", {
      err: "Something went Wrong during registration"});
  }
};


 // Create and Save new User

  export const createUser = async(tempUser)=>{
      try{
        const {name,email,phone,password} = tempUser;
        const newUser = new User({
          name,
          email,
          phone,
          password,
          isVerified:true,
        });
           
        await newUser.save();
        return newUser;

      }catch(err){
          console.error('Error Creating User:',err);
          return null
      }
  };

  // Verify OTP 

  export const verifyOTP = async (req, res) => {
    try {
      const { email, otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
      const fullOTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
      console.log("Submitted OTP:", fullOTP);
  
      // Find the OTP record
      const otpRecord = await OTP.findOne({ email });
      console.log("Found OTP record:", otpRecord);
  
      if (!otpRecord) {
        return res.render('user/verify-otp', { email, err: 'OTP expired or not found' });
      }
  
      // Match the OTP
      if (otpRecord.otp === fullOTP) {
        const tempUser = req.session.tempUser;
  
        if (!tempUser) {
          return res.render('user/verify-otp', { email, err: 'Registration data not found' });
        }
  
        // Save user to DB (if not already saved) — assuming you're doing it now
        const newUser = await User.create(tempUser);
  
        // Clear tempUser and OTP
        delete req.session.tempUser;
        await OTP.deleteOne({ email });
  
        // Authenticate user
        req.session.userId = newUser._id;
  
        // Redirect to home page
        return res.render('user/home', { user: newUser });
      } else {
        return res.render('user/verify-otp', { email, err: 'Invalid OTP. Please try again' });
      }
  
    } catch (err) {
      console.error('OTP verification error:', err);
      return res.render('user/verify-otp', { err: 'Server error. Please try again' });
    }
  }
  















export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Note: In a real application, you should compare hashed passwords
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Something went wrong during login" });
  }
};
