import { Request } from 'express';

export interface FortiLLMRequest extends Request {
  conversationHistory?: string;
}
