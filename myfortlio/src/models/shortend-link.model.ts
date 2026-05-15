import mongoose from 'mongoose';

const shortendLinkSchema = new mongoose.Schema(
  {
    originalUrl: { type: String, required: true, maxlength: 255 },
    shortCode: { type: String, required: true, unique: true, maxlength: 20, index: true },
    accessCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

const ShortendLink = mongoose.model('shortend-links', shortendLinkSchema);

export default ShortendLink;