import mongoose from 'mongoose';
import { IUserDoc } from '../interface/user-interface';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    status: { type: Boolean, default: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
    email: { type: String, required: true, unique: true, index: true },
    userPrivileges: { type: [String], required: true, default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isOnboarded: { type: Boolean, default: false },
    coins: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

userSchema.virtual('userId').get(function () {
  return this._id;
});

const User = mongoose.model<IUserDoc>('user', userSchema);

export default User;
