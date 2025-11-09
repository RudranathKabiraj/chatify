//A Controller is simply a function that handles a request to a specific route.
//A controller is the “brain” that receives a request (req), processes it, and sends back a response (res).

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";

//sign-up process
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({message:"All fields are required"})
    }
    if (password.length < 6) {
      return res.status(400).json({message:"Password must be altleat 6 characters long"})
    }
    //check if emails valid: regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    //Check if email already exists in DB
    const user = await User.findOne({email});
    if(user) return res.status(400).json({message:"Email already exists"})

    //What does bcrypt.hash(password, salt) do?

    //It combines the plain password the user entered, and the random salt you generated,
    //and produces a hashed version — an irreversible string like:, A salt is a random string of characters added to the password before hashing , 
    //  It ensures that two users with the same password will still have different hashes.
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password , salt)

    const newUser = new User({
        fullName,
        email,
        password:hashedPassword
    })

    if(newUser){
        generateToken(newUser._id , res)
        await newUser.save()

        //sending this things back to user so they   know they are signned in succesfully
        res.status(201).json({
          _id:newUser._id,
          fullName:newUser.fullName,
          email:newUser.email,
          profilePic:newUser.profilePic,

        })

    }else{
        res.status(400).json({message:"Invalid user data"})
    }

    // todo: send a welcome email to user
    
    
  } catch (error) {
    console.log("Error in signup controller: ,",error);
    res.status(500).json({message:"Internal server error"})
    
  }
};
