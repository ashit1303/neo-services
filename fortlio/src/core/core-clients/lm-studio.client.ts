
import { Config } from '../../interface/common.interface';
import { get, post } from '../core-utils';
import { AppError } from '../core-utils/err-util';
import { SecretManager } from './secret-manager.client';

export class LMStudioClient {
  private secretManager: SecretManager;
  private baseUrl: string;
  private model: string;

  constructor(config: Config) {
    this.secretManager = new SecretManager(config);
    this.baseUrl = '';
    this.model = '';
    this.initClient();
  }

  private async initClient(): Promise<void> {
    const secrets = await this.secretManager.get('LM_STUDIO_CONFIG').then((res) => JSON.parse(res));
    this.baseUrl = secrets.HOST;
    this.model = secrets.MODEL;

    if (!this.baseUrl || !this.model) {
      throw new AppError('Failed to fetch LM Studio configuration');
    }
  }

  async generateResponse(prompt: string) {
    try {
      const response = await post(`${this.baseUrl}/v1/chat/completions`, { model: this.model, messages: [{ role: 'user', content: prompt }], stream: false });

      return response;
    } catch (error: any) {
      throw new AppError(`LM Studio API error: ${(error as Error).message}`);
    }
  }
  async listModels() {
    try {
      const response = await get(`${this.baseUrl}/v1/models`);
      return response;
    } catch (error: any) {
      throw new AppError(`Failed to fetch models: ${(error as Error).message}`);
    }
  }

  async chat(messages: Array<{ role: string; content: string }>) {
    try {
      const response = await post(`${this.baseUrl}/v1/chat/completions`, { model: this.model, messages, stream: false });
      return response;
    } catch (error: any) {
      throw new AppError(`Chat API error: ${(error as Error).message}`);
    }
  }
  async chatStream(messages: Array<{ role: string; content: string }>, onToken: (token: string) => void) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: this.model, messages, stream: true }) });

      if (!response.ok) { throw new Error(`HTTP ${response.status}`); }

      if (!response.body) { throw new Error('No response body'); }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) { break; }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) { continue; }
          const data = trimmed.replace(/^data:\s*/, '');
          if (data === '[DONE]') { return; }
          try {
            const json = JSON.parse(data);
            const token = json.choices?.[0]?.delta?.content || '';
            if (token) { onToken(token); }
          } catch (err) { console.error('Failed to parse SSE chunk:', err); }
        }
      }
    } catch (error: any) {
      throw new AppError(`Streaming chat error: ${(error as Error).message}`);
    }
  }
  // await client.chatStream([{ role: "user", content: "Write a poem about AI" }], (token) => { process.stdout.write(token); });
  // res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  // res.setHeader("Content-Type", "text/event-stream");
  // res.setHeader("Cache-Control", "no-cache");
  // res.setHeader("Connection", "keep-alive");
}

