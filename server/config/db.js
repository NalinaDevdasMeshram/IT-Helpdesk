import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("database connected successfully..");
  } catch (error) {
    console.log("error connecting to database", error.message);
  }
};
export default connectDB;
