import mongoose from 'mongoose';
import { generateRandomString } from '../core/core-utils';
import { IUserDoc } from '../interface/user-interface';

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    status: { type: Boolean, default: true },
    mobileNumber: { type: String, required: true, unique: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'role', required: true },
    email: { type: String },
    userPrivileges: { type: [String], required: true, default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    referralCode: { type: String, unique: true, match: /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{4}$/, default: generateRandomString },
    coinBalance: { type: Number, default: 0 },

  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

userSchema.virtual('userId').get(function () {
  return this._id;
});

const User = mongoose.model<IUserDoc>('user', userSchema);

export default User;
