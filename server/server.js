import express from "express";
import dotenv from "dotenv";
const app = express();
const PORT = process.env.PORT || 8000;
dotenv.config();
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import ticketRoute from "./routes/ticketRoute.js";
import reportRoute from "./routes/reportRoute.js";

//connecting database
connectDB();

// middleware
app.use(express.json());

//routes
app.use("/auth/api/", authRoute);
app.use("/api/tickets", ticketRoute);
app.use("/api/report", reportRoute);

app.listen(process.env.PORT, () => {
  console.log(`helpdesk is running  on port ${process.env.PORT}`);
});
