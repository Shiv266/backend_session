import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URI}/${process.env.DATABASE_NAME}`
    );
    console.log(`Mongodb connected to ${connectionInstance.connection.host}`);
  } catch (e) {
    console.error("Mongodb connection Failed: ", e);
    process.exit(1);
  }
};

export default connectDB;
