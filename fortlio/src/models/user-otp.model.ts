import mongoose from 'mongoose';
import { IUserOTP } from '../interface/user-interface';

const userOtpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
    otp: { type: String, required: true },
    expiryAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

const UserOTP = mongoose.model<IUserOTP>('user-otp', userOtpSchema);

export default UserOTP;
