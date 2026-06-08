import mongoose from 'mongoose';

const profileViewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
    viewedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'viewedAt', updatedAt: false } }
);

// Unique index to keep only the most recent view per viewer/target
profileViewSchema.index({ userId: 1, viewedUserId: 1 }, { unique: true });

const ProfileViewHistory = mongoose.model('profile_view_history', profileViewSchema);
export default ProfileViewHistory;
