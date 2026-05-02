import mongoose from 'mongoose';

const filesSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true, maxlength: 127 },
    fileSize: { type: Number, default: 0, min: 0 },
    fileSha: { type: String, required: true, unique: true, maxlength: 64, index: true },
    filePath: { type: String, required: true, maxlength: 255 },
    shortCode: { type: String, maxlength: 31 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null, index: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

// Explicit index (optional, since unique already creates one)
filesSchema.index({ fileSha: 1 }, { unique: true });

const FileStore = mongoose.model('file-stores', filesSchema);
export default FileStore;