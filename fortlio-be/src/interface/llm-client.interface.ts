export interface ILLMClient {
  generateResponse(prompt: string): Promise<any>;
  listModels(): Promise<any>;
  chat(messages: Array<{ role: string; content: string }>): Promise<any>;
  streamChat(messages: Array<{ role: string; content: string }>): AsyncGenerator<string>;
  healthCheck(): Promise<boolean>;
}
