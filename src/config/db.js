import mongoose from "mongoose";
const connectDB = async () => {
    try {
        const conection = await mongoose.connect(process.env.MONGO_URI);
        console.log("Database Connect successfull");
    } catch (err) {
        console.error(" DB Error:", err.message);
        process.exit(1);
    }
}
export default connectDB;