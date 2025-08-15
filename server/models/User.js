import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorCode: String,
    twoFactorCodeExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
