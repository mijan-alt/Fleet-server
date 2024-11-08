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

    name: {
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







const User = mongoose.model<UserInterface>("User", UserSchema);

export default User;
