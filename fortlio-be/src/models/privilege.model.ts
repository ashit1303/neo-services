import mongoose from 'mongoose';
import { IPrivilege } from '../interface/user-interface';

const privilegeSchema = new mongoose.Schema<IPrivilege>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    tag: { type: [String] },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

privilegeSchema.virtual('privilegeId').get(function () {
  return this._id;
});

const Privilege = mongoose.model('privileges', privilegeSchema);

export default Privilege;

