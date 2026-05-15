import mongoose from 'mongoose';

const questsSchema = new mongoose.Schema(
  {
    titleSlug: { type: String, required: true, unique: true, maxlength: 255, index: true },
    questionId: { type: Number, default: null },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: null },
    questionTitle: { type: String, default: null, maxlength: 255 },
    content: { type: String, default: null },
    cleanedContent: { type: String, default: null },
    categoryTitle: { type: String, default: null, maxlength: 31 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);
// questsSchema.index({ titleSlug: 1 }, { unique: true });

const DsaQuestions = mongoose.model('dsa-questions', questsSchema);
export default DsaQuestions;