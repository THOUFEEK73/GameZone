import User from "../models/userModel.js";
import dotenv from "dotenv";
import OTP from "../models/otpModel.js";
import { generateOTP } from "../utils/otp-functions.js";
import { comparePassword, hashPassword } from "../utils/hash.js";

dotenv.config();

export const getSignUpPage = (req, res) => {
  if (req.session.userId) return res.redirect('/home');
  res.render("user/signup", { err: null });
};

export const postSignUp = async (req, res) => {
  try {
    const { name, email, phone, password, confirm_password } = req.body;

    if (!name || !email || !phone || !password || !confirm_password) {
      return res.render("user/signup", { err: "Please Fill The Empty Field" });
    }

    if(password!==confirm_password){
      return res.render('user/signup',{err:'Password Not Match'});
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("user/signup", { err: "User Already Exist" });
    }

    req.session.tempUser = { name,
       phone,
        email,password:await hashPassword(password), 
      };

    const otpSent = await generateOTP(email);
    if (!otpSent) {
      return res.render("user/signup", { err: "Failed To Send OTP" });
    }

    res.render("user/verify-otp", { email });
  } catch (error) {
    console.error("Signup error", error);
    res.render("user/signup", { err: "Something went Wrong during registration" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp1, otp2, otp3, otp4, otp5, otp6 } = req.body;
    const fullOTP = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.render("user/verify-otp", { email, err: "OTP expired or not found." });
    }

    if (otpRecord.otp !== fullOTP) {
      return res.render("user/verify-otp", { email, err: "Invalid OTP." });
    }

    const tempUser = req.session.tempUser;
    if (!tempUser) {
      return res.render("user/verify-otp", { email, err: "Registration data not found." });
    }

    const newUser = await createUser(tempUser);

    delete req.session.tempUser;
    await OTP.deleteOne({ email });

    req.session.userId = newUser._id;
    req.session.user = {
      name: newUser.name,
      email: newUser.email
    };

    return res.redirect('/home');
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.render("user/verify-otp", {
      email: req.body.email,
      err: "Server error. Please try again.",
    });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    await OTP.deleteOne({ email });

    const otpSent = await generateOTP(email);
    if (!otpSent) {
      return res.status(500).json({ message: "Failed to send OTP." });
    }

    return res.status(200).json({ message: "OTP has been resent to your email." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

export const getLoginPage = (req, res) => {
  if (req.session.userId) return res.redirect('/home');
  res.render("user/login", { err: null });
};

export const postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
       const existingUser = await User.findOne({email});
       if(!existingUser){
        return res.render('user/login',{err:'User Not Found'});

       }
    if (!email || !password) {
      return res.render("user/login", { err: "Email and Password are required" });
    }
   const user = await User.findOne({email})

    if (!user || !(await comparePassword(password,user.password))) {
      return res.render("user/login", { err: "Email and Password are required" });
    }


    req.session.userId = user._id;
    req.session.user = {
      name: user.name,
      email: user.email,
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.render("user/login", { err: "Server error. Try again." });
      }
      return res.redirect("/home");
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.render("user/login", { err: "Server error. Please try again." });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: "Error destroying session" });
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
};
