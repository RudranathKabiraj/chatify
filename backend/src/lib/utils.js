import jwt from "jsonwebtoken";

export const generateToken =(userId,res) =>{

    const{ JWT_SECRET} = process.env;
    if( !JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }
    // jwt.sign(  payload(the data you want to store inside the token) ,   secret ,   options  )
    const token = jwt.sign({userId:userId},JWT_SECRET,{
        expiresIn:"7d",
    });

    res.cookie("jwt",token, {
        maxAge:7*24*60*60*1000,
        httpOnly: true, // prevent XSS attacks: cross-site scripting
        sameSite: "strict", //CSRF attacks   Only send this cookie if the request is coming directly from the same site.
        secure: process.env.NODE_ENV === "development" ? false : true,
    });

    return token;
} 