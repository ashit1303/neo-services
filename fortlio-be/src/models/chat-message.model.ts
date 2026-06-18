import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    connectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'connection', required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

chatMessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

const ChatMessage = mongoose.model('chat_message', chatMessageSchema);
export default ChatMessage;
