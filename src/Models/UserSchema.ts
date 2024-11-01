import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import { UserInterface } from "../interfaces";


const UserSchema = new mongoose.Schema<UserInterface>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
     
    },

    username: {
      type: String,
    },

    verificationToken: String || null,
    verificationTokenExpiresAt: Date || null,

    passwordResetToken: String,
    passwordResetTokenExpire: Date,
    emailVerified: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);




UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // If password is not modified, proceed to the next middleware
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (userPassword: string) {
  const isMatch = await bcrypt.compare(userPassword, this.password);
  return isMatch;
};

UserSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  //encrypt the reset token with createHeash and convert the result into hexadecimal format
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log(resetToken, this.passwordResetToken);
  // We want this token to expire in 10 minutes
  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};



const User = mongoose.model<UserInterface>("User", UserSchema);

export default User;
