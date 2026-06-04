import mongoose from 'mongoose';
import { IUserPrivate } from '../interface/user-interface';

const userOtpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
    // otp: { type: String, required: true },
    // expiryAt: { type: Date, required: true },
    provider: { type: String, enum: ['EMAIL', 'GOOGLE', 'GITHUB'], required: true },
    passwordHash: { type: String },
    emailVerified: { type: Boolean, default: false },
    verificationTokenHash: { type: String },
    verificationTokenExpiresAt: { type: Date, default: Date.now },
    refreshTokenHash: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

const UserPrivate = mongoose.model<IUserPrivate>('user-private', userOtpSchema);

export default UserPrivate;
