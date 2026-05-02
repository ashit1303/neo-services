
import { Config } from '../../interface/common.interface';
import { get, post } from '../core-utils';
import { SecretManager } from './secret-manager.client';

export class OllamaClient {
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
    this.baseUrl = secrets.baseUrl;
    this.model = secrets.model;

    if (!this.baseUrl || !this.model) {
      throw new Error('Failed to fetch Ollama configuration');
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
    } catch (error) {
      throw new Error(`Ollama API error: ${(error as Error).message}`);
    }
  }
  async listModels() {
    try {
      const response = await get(`${this.baseUrl}/api/tags`);
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch models: ${(error as Error).message}`);
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
    } catch (error) {
      throw new Error(`Chat API error: ${(error as Error).message}`);
    }
  }
}
