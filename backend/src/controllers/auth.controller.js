//A Controller is simply a function that handles a request to a specific route.
//A controller is the “brain” that receives a request (req), processes it, and sends back a response (res).

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import "dotenv/config";

//sign-up process
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    // 1) VALIDATION
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be altleat 6 characters long" });
    }

    //check if emails valid: regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    //Check if email already exists in DB
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    //What does bcrypt.hash(password, salt) do?

    //It combines the plain password the user entered, and the random salt you generated,
    //and produces a hashed version — an irreversible string like:, A salt is a random string of characters added to the password before hashing , 
    //  It ensures that two users with the same password will still have different hashes.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3) CREATE USER MODEL
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword
    });

    // 4) SAVE USER
    const savedUser = await newUser.save();

    // 5) GENERATE TOKEN
    generateToken(savedUser._id, res);

    // 6) SEND WELCOME EMAIL (optional)
    try {
      await sendWelcomeEmail(savedUser.email, savedUser.fullName, process.env.CLIENT_URL);
    } catch (emailError) {
      console.log("Failed to send welcome email: ", emailError);
    }

    //sending this things back to user so they   know they are signned in succesfully
    // 7) SEND RESPONSE TO FRONTEND
    return res.status(201).json({
      _id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      profilePic: savedUser.profilePic,
    });

  } catch (error) {
    console.log("Error in signup controller: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// LOGIN
export const login = async (req,res) =>{
  const { email,password} = req.body;

  try {
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({message:"Invalid credintials"});
    // never tell the client which one is incorrect: password or email

    const isPasswordCorrect  = await bcrypt.compare(password,user.password)
    if(!isPasswordCorrect) return res.status(400).json({message:"Invalid credintials"});

    generateToken(user._id,res)

     return res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller" , error)
    res.status(500).json({ message:"Internal server error " })
  }
}
// LOGOUT
export const logout = (_,res) =>{
  res.cookie("jwt","",{ maxAge: 0 });
  // Clear the "jwt" cookie by setting it to an empty string ""
  // AND setting maxAge: 0 → cookie expires IMMEDIATELY
  // This effectively removes the cookie from the browser

  res.status(200).json({message:"Logged out succesfully"})
}

