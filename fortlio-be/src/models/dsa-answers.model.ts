import mongoose from 'mongoose';

const questsAnswerSchema = new mongoose.Schema(
  {
    questionId: { type: Number, default: null },
    codeLang: { type: String, enum: ['js', 'python', 'java', 'c++', 'go'], default: null },
    llmRes: { type: String, default: null },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

const DsaAnswer = mongoose.model('dsa-answers', questsAnswerSchema);

export default DsaAnswer;