import User from "../models/userModel.js";
import dotenv from "dotenv";
import sendEmail from "../utils/mailer.js";
import crypto from "crypto"; // Add this import
import OTP from "../models/otpModel.js";
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
      err: "Something went Wrong during registration",
    });
  }
};

// Create and Save new User

export const createUser = async (tempUser) => {
  try {
    const { name, email, phone, password } = tempUser;
    const newUser = new User({
      name,
      email,
      phone,
      password,
      isVerified: true,
    });

    await newUser.save();
    return newUser;
  } catch (err) {
    console.error("Error Creating User:", err);
    return null;
  }
};

// Verify OTP

// ... existing imports and code ...

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
    const fullOTP = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;
    
    // Find the OTP record
    const otpRecord = await OTP.findOne({ email });
    
    if (!otpRecord) {
      return res.render("user/verify-otp", {
        email,
        err: "OTP expired or not found. Please request a new OTP.",
      });
    }

    // Match the OTP
    if (otpRecord.otp !== fullOTP) {
      return res.render("user/verify-otp", {
        email,
        err: "Invalid OTP. Please try again.",
      });
    }

    // Get user data from session
    const tempUser = req.session.tempUser;
    if (!tempUser) {
      return res.render("user/verify-otp", {
        email,
        err: "Registration data not found. Please register again.",
      });
    }

    try {
      // Create new user
      const newUser = await User.create({
        name: tempUser.name,
        email: tempUser.email,
        phone: tempUser.phone,
        password: tempUser.password,
        isVerified: true
      });

      // Clear session data and OTP
      delete req.session.tempUser;
      await OTP.deleteOne({ email });

      // Set session for authenticated user
      req.session.userId = newUser._id;
      req.session.user = {
        name: newUser.name,
        email: newUser.email
      };

      // Redirect to home page
      return res.redirect('/home');
    } catch (error) {
      console.error('User creation error:', error);
      return res.render("user/verify-otp", {
        email,
        err: "Failed to create user account. Please try again.",
      });
    }
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.render("user/verify-otp", {
      email: req.body.email,
      err: "Server error. Please try again.",
    });
  }
};

// Add resend OTP functionality
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Delete existing OTP if any
    await OTP.deleteOne({ email });
    
    // Generate and send new OTP
    const otpSent = await generateOTP(email);
    
    if (!otpSent) {
      return res.status(500).json({ 
        message: "Failed to send OTP. Please try again." 
      });
    }
    
    return res.status(200).json({ 
      message: "OTP has been resent to your email." 
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ 
      message: "Server error. Please try again." 
    });
  }
};

// ... rest of the existing code ...

export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("user/login", {
        err: "Email and Password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("user/login", { err: "Invalid Credentials" });
    }

    // Note: In a real application, you should compare hashed passwords
    if (user.password !== password) {
      return res.render("user/login", { err: "Invalid Credentials" });
    }
    // Set session data
    req.session.userId = user._id;
    req.session.userId = {
      name: user.name,
      email: user.email,
    };

    // Save session and Redirect
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.render("user/login", {
          err: "Server error Please Try Again",
        });
      }
      return res.render("user/home", { user });
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.render("user/login", { err: "Server error Please Try Again" });
  }
};
