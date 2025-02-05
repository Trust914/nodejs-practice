import mongoose from "mongoose";

const { Schema } = mongoose;

// user schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username must be specified"],
      unique: [true, "A user with that username already exists"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "A user with that email already exists"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password must be specified"],
      minLength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: {
        values: ["user", "admin"],
        message: "{VALUE} is not supported. Role type must be user or admin",
      },
      default: "user",
    },
    dateOfBirth: {
      type: Date,
      required: [
        function () {
          return this.role === "user";
        },
        "User date of birth is required",
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
