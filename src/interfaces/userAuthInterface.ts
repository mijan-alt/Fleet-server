import mongoose from "mongoose";
import { Types } from "mongoose";
import { Document } from "mongodb";

interface UserInterface extends Document {
  name: string;
  email: string;
  password: string;
  passwordResetToken: String | undefined;
  passwordResetTokenExpire?: Date;
  googleId?: string;
  emailVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiresAt?: Date | null;
}



export { UserInterface };
