import * as Typesense from 'typesense';
import { Config } from '../../interface/common.interface';
import { SecretManager } from './secret-manager.client';
import { AppError } from '../core-utils/err-util';

export class TypesenseService {
  private secretManager: SecretManager;

  private typesenseSearch!: Typesense.Client;

  private initialized = false;

  constructor(config: Config) {
    this.secretManager = new SecretManager(config);
  }

  private async initClient(): Promise<void> {
    const secrets = await this.secretManager
      .get('TYPESENSE_CONFIG')
      .then((res) => JSON.parse(res));

    const typesenseConfig = {
      nodes: [
        {
          host: secrets.TYPESENSE_HOST,
          protocol: secrets.TYPESENSE_PROTOCOL || 'http',
          port: Number(secrets.TYPESENSE_PORT),
        },
      ],
      numRetries: 3,
      connectionTimeoutSeconds: 10,
      apiKey: secrets.TYPESENSE_API_KEY,
    };

    if (!secrets.TYPESENSE_HOST || !secrets.TYPESENSE_API_KEY) {
      throw new AppError('Failed to fetch Typesense configuration');
    }

    this.typesenseSearch = new Typesense.Client(typesenseConfig);
    this.initialized = true;
  }

  private async ensureInit() {
    if (!this.initialized) {
      await this.initClient();
    }
  }

  // ---------------- CORE METHODS ----------------

  async createCollection(schemaToUse: any): Promise<any> {
    await this.ensureInit();
    return this.typesenseSearch.collections().create(schemaToUse);
  }

  async search<T extends object>(collectionName: string, searchParameters: any): Promise<Typesense.SearchResponse<T>> {
    await this.ensureInit();
    return this.typesenseSearch
      .collections<T>(collectionName)
      .documents()
      .search(searchParameters);
  }

  async push(collectionName: string, document: any): Promise<any> {
    await this.ensureInit();
    return this.typesenseSearch
      .collections(collectionName)
      .documents()
      .create(document);
  }

  async ping(): Promise<boolean> {
    await this.ensureInit();

    try {
      await this.typesenseSearch.health.retrieve();
      return true;
    } catch (error: any) {
      console.error('Typesense ping failed:', error);
      return false;
    }
  }

  async retrieveDocument(collectionName: string, documentId: string): Promise<any> {
    await this.ensureInit();
    return this.typesenseSearch
      .collections(collectionName)
      .documents(documentId)
      .retrieve();
  }

  async remove(collectionName: string, documentId: string): Promise<any> {
    await this.ensureInit();
    return this.typesenseSearch
      .collections(collectionName)
      .documents(documentId)
      .delete();
  }

  async flushCollection(collectionName: string) {
    await this.ensureInit();
    return this.typesenseSearch.collections(collectionName).delete();
  }

  async importCollection(documentsArray: any[], collectionName: string) {
    await this.ensureInit();

    return this.typesenseSearch
      .collections(collectionName)
      .documents()
      .import(documentsArray, { action: 'upsert' });
  }

  async getCollection(name: string) {
    await this.ensureInit();
    return this.typesenseSearch.collections(name).retrieve();
  }

  async createSynonym(collectionName: string, synonymSchema: any) {
    await this.ensureInit();

    return this.typesenseSearch
      .collections(collectionName)
      .synonyms()
      .upsert(synonymSchema.id, synonymSchema);
  }

  async createKey(keySchema: any) {
    await this.ensureInit();
    return this.typesenseSearch.keys().create(keySchema);
  }
}