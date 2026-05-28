import mongoose from 'mongoose';
import { IRoleDoc } from '../interface/user-interface';

const roleSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true, unique: true },
    description: { type: String },
    createdBy: { type: String },
    modifiedBy: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    rolePrivileges: [{ type: String }],
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

roleSchema.virtual('roleId').get(function () {
  return this._id;
});
const Role = mongoose.model<IRoleDoc>('role', roleSchema);

export default Role;
