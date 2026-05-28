
import { Config } from '../../interface/common.interface';
import { get, post } from '../core-utils';
import { AppError } from '../core-utils/err-util';
import { SecretManager } from './secret-manager.client';
import { ILLMClient } from '../../interface/llm-client.interface';

export class OllamaClient implements ILLMClient {
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
    const secrets = await this.secretManager.get('OLLAMA_CONFIG').then((res) => JSON.parse(res));
    this.baseUrl = secrets.HOST;
    this.model = secrets.MODEL;

    if (!this.baseUrl || !this.model) {
      throw new AppError('Failed to fetch Ollama configuration');
    }
  }

  async generateResponse(prompt: string) {
    try {
      const response = await post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
      });
      return response;
    } catch (error: any) {
      throw new AppError(`Ollama API error: ${(error as Error).message}`);
    }
  }
  async listModels() {
    try {
      const response = await get(`${this.baseUrl}/api/tags`);
      return response;
    } catch (error: any) {
      throw new AppError(`Failed to fetch models: ${(error as Error).message}`);
    }
  }

  async chat(messages: Array<{ role: string; content: string }>) {
    try {
      const response = await post(`${this.baseUrl}/api/chat`, {
        model: this.model,
        messages,
        stream: false,
      });
      return response;
    } catch (error: any) {
      throw new AppError(`Chat API error: ${(error as Error).message}`);
    }
  }
  async *streamChat(messages: Array<{ role: string; content: string }>) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, messages, stream: true }),
      });

      if (!response.body) {
        throw new AppError('No body OllamaClient.*streamChat');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) { break; }
        const chunk = decoder.decode(value, { stream: true });
        yield chunk;
      }
    } catch (error: any) {
      throw new AppError(`Stream Chat API error: ${(error as Error).message}`);
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error: any) {
      throw new AppError(`Health check failed: ${(error as Error).message}`);
    }
  }

}
