import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true, index: true },
    query: { type: String, required: true },
    filters: { type: mongoose.Schema.Types.Mixed, default: {} },
    searchedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'searchedAt', updatedAt: false } }
);

// Keep unique query per user to avoid duplicate entries in recent searches
searchHistorySchema.index({ userId: 1, query: 1 }, { unique: true });

const SearchHistory = mongoose.model('search_history', searchHistorySchema);
export default SearchHistory;
