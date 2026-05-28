import crypto from 'crypto';
import { Request, Response } from 'express';
import { buildObenPrompts } from '../service-helper/forti-llm.service-helper';
import { FortiLLMRequest } from '../interface/forti-llm.interface';
import type { FortiLLMService } from '../services/forti-llm.service';

export class FortiLLMController {
  constructor(private obiLLMService: FortiLLMService) { }

  getAnswerFromQuestion = async (req: FortiLLMRequest, res: Response) => {
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
    } catch (error: any) {
      console.error(error);
      res.write(`data: ${JSON.stringify('FAILED_TO_INITIATE_LLM')}\n\n`);
      res.write(`data: ${JSON.stringify({ d: true })}\n\n`);
      res.end();
    }
  };

  getSession = async (_req: Request, res: Response) => {
    try {
      const sessionId = crypto.randomBytes(32).toString('hex');
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: true, // HTTPS only
        sameSite: 'lax', // CSRF protection
        maxAge: 2 * 60 * 60 * 1000,
      });
      res.json({ success: true });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
