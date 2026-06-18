import mongoose from 'mongoose';
import { ICandidateBlogDoc } from '../interface/candidate-interface';

const candidateBlogSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    blogKeywords: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

candidateBlogSchema.virtual('blogId').get(function () {
  return this._id;
});

const CandidateBlog = mongoose.model<ICandidateBlogDoc>('candidate_blog', candidateBlogSchema);

export default CandidateBlog;
