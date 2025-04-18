import User from "../models/userModel.js";

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
