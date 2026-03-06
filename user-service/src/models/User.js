import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    // Google OAuth
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allows null for non-google users
    },
    avatar: {
      type: String,
      default: "",
    },

    // Role-based access
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // JWT refresh token storage
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;