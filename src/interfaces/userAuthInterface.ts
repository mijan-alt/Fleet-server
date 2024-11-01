import mongoose from "mongoose";
import { Types } from "mongoose";
import { Document } from "mongodb";

interface UserInterface extends Document {
  username: string;
  email: string;
  password: string;
  passwordResetToken: String | undefined;
  passwordResetTokenExpire?: Date;
  googleId?: string;
  emailVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpiresAt?: Date | null;
}

interface BusinessInterface extends Document {
  businessName: string;
  businessEmail: string;
  businessLogo: string;
  businessCategory: string;
  businessWebsite: string;
  businessBio: string;
  userId: Types.ObjectId;
  emailList: Types.ObjectId[];
}

export { UserInterface, BusinessInterface };
