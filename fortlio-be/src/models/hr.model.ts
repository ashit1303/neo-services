import mongoose from 'mongoose';

const hrSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, unique: true, index: true },
    mobileNumber: { type: String, default: '' },
    companyName: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    designation: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

hrSchema.virtual('hrId').get(function () {
  return this._id;
});

const HrProfile = mongoose.model('hr_profile', hrSchema);
export default HrProfile;
