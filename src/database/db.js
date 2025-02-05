import mongoose from "mongoose";

export async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Successfully connected to the mongoDB database");
  } catch (error) {
    console.error({
      connectionStatus: false,
      message: "Encountered an error while trying to connect to MongoDB",
      error,
    });
    process.exit(1); 
  }
}
