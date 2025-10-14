import express from "express";
    import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js"

    dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();


app.use("/api/auth",authRoutes)
app.use("/api/message" , messageRoutes)

//make ready for deployment
if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))   //express.static() is used to serve the frontend build files (HTML, CSS, JS) directly from the backend.


    //For any route not matching an API, send index.html so the React app can handle routing.
    app.get("*", (_,res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
    });

}
app.listen(PORT, () => console.log("server is running at port: "+PORT));
