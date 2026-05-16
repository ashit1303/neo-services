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
          host: secrets.host,
          protocol: secrets.protocol || 'http',
          port: Number(secrets.port),
        },
      ],
      numRetries: 3,
      connectionTimeoutSeconds: 10,
      apiKey: secrets.apiKey,
    };

    if (!secrets.host || !secrets.apiKey) {
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

  async search(
    collectionName: string,
    searchParameters: any,
  ): Promise<any> {
    await this.ensureInit();
    return this.typesenseSearch
      .collections(collectionName)
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

  async retrieveDocument(collectionName: string, documentId: string) {
    await this.ensureInit();
    return this.typesenseSearch
      .collections(collectionName)
      .documents(documentId)
      .retrieve();
  }

  async remove(collectionName: string, documentId: string) {
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
      .import(documentsArray, { action: 'create' });
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

  async searchInDepth(
    q: string,
    query_by: string,
    filter_by: string,
    sort_by: string,
    facet_by: string,
  ) {
    await this.ensureInit();

    return this.typesenseSearch
      .collections('products')
      .documents()
      .search({ q, query_by, filter_by, sort_by, facet_by });
  }

  async createKey(keySchema: any) {
    await this.ensureInit();
    return this.typesenseSearch.keys().create(keySchema);
  }
}