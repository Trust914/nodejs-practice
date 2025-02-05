import express from "express";
import { connectToDB } from "./database/db.js";
import authRoutes from "./routes/authRoutes.js";
import userHomeRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

// middlware to allow the server to parse json data
app.use(express.json());

// connect to the database
await connectToDB();

// routes to use
app.use("/api/auth/", authRoutes);
app.use("/dashboard", userHomeRoutes);
app.use("/admin", adminRoutes);
app.use("/image", imageRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
