import crypto from 'crypto';
import { Request, Response } from 'express';
import { buildObenPrompts } from '../service-helper/forti-llm.service-helper';
import { FortiLLMRequest } from '../interface/forti-llm.interface';
import FortiLLMService from '../services/forti-llm.service';
import { ERR_MSGS } from '../constants/authn-err-msg.constants';

class FortiLLMController {
  private obiLLMService;
  constructor() {
    this.obiLLMService = new FortiLLMService();
  }

  async getAnswerFromQuestion(req: FortiLLMRequest, res: Response) {
    try {
      // Rolling summary memory (sliding compression window)
      const { question } = req.query as { question: string };

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const { orchestrationPrompt, generationPrompt } = buildObenPrompts({ query: question, conversationHistory: req.conversationHistory });
      const { command, client } = await this.obiLLMService.getAnswerFromKnowledgeBase(question, orchestrationPrompt, generationPrompt);
      const response = await client.send(command);
      const fullText = response.output?.text || '';

      // split into words
      const words = fullText.split(' ');
      const BATCH_SIZE = 5;
      let buffer = [];

      for (let i = 0; i < words.length; i++) {
        buffer.push(words[i]);
        if (buffer.length === BATCH_SIZE) {
          res.write(`data: ${JSON.stringify({ t: buffer.join(' ') })}\n\n`);
          buffer = [];
        }
      }
      if (buffer.length > 0) {
        res.write(`data: ${JSON.stringify({ t: buffer.join(' ') })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ d: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error(error);
      res.write(`data: ${JSON.stringify(ERR_MSGS.FAILED_TO_INITIATE_LLM)}\n\n`);
      res.write(`data: ${JSON.stringify({ d: true })}\n\n`);
      res.end();
    }
  }

  async getSession(_req: Request, res: Response) {
    try {
      const sessionId = crypto.randomBytes(32).toString('hex');
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: true,     // HTTPS only
        sameSite: 'lax',  // CSRF protection
        maxAge: 2 * 60 * 60 * 1000,
      });
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default FortiLLMController;