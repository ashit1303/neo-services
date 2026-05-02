import * as SonicChannel from 'sonic-channel';
import { Config } from '../../interface/common.interface';
import { SecretManager } from './secret-manager.client';

export class SonicClient {
  private secretManager: SecretManager;
  private sonicConfig: { host: string; port: number; auth: string };
  private sonicSearch!: SonicChannel.Search;
  private sonicIngest!: SonicChannel.Ingest;
  private bucket: string;

  constructor(config: Config, bucket: string) {
    this.bucket = bucket;
    this.secretManager = new SecretManager(config);
    this.sonicConfig = { host: '', port: 0, auth: '' };
    this.initClient();
  }

  private async initClient(): Promise<void> {
    const secrets = await this.secretManager.get('SONIC_CONFIG').then((res) => JSON.parse(res));
    this.sonicConfig.host = secrets.host;
    this.sonicConfig.port = secrets.port;
    this.sonicConfig.auth = secrets.auth;

    this.sonicSearch = new SonicChannel.Search(this.sonicConfig).connect({
      connected: () => console.info('Sonic Channel connected (search).'),
      disconnected: () => console.error('Sonic Channel disconnected (search).'),
      timeout: () => console.error('Sonic Channel connection timed out (search).'),
      retrying: () => console.error('Trying to reconnect to Sonic Channel (search)...'),
      error: (error) => console.error('Sonic Channel connection failed (search).', error),
    });

    this.sonicIngest = new SonicChannel.Ingest(this.sonicConfig).connect({
      connected: () => console.info('Sonic Channel connected (search).'),
      disconnected: () => console.error('Sonic Channel disconnected (search).'),
      timeout: () => console.error('Sonic Channel connection timed out (search).'),
      retrying: () => console.error('Trying to reconnect to Sonic Channel (search)...'),
      error: (error) => console.error('Sonic Channel connection failed (search).', error),
    });
  }

  async search(collection: string, query: string): Promise<string[]> {
    return new Promise((resolve, reject) => {

      this.sonicSearch.query(collection, this.bucket, query, { limit: 10, offset: 0 })
        .then((results) => resolve(results))
        .catch((err) => reject(err));
    });
  }
  async push(collection: string, object: string, text: string): Promise<string[]> {
    return new Promise((resolve, reject) => {

      this.sonicIngest.push(collection, this.bucket, object, text)
        .then(() => resolve([]))
        .catch((err) => reject(err));
    });
  }

  async suggest(collection: string, query: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.sonicSearch.suggest(collection, this.bucket, query, { limit: 10 })
        .then((results) => resolve(results))
        .catch((err) => reject(err));
    });
  }

  async ping(): Promise<Boolean> {
    return new Promise((resolve, reject) => {
      this.sonicSearch.ping()
        .then(() => resolve(true))
        .catch((err) => reject(err));
    });
  }

  async remove(collection: string, object: string, text: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // this.sonicIngest.push(collection,bucket,text, {lang: 'en'})
      this.sonicIngest.pop(collection, this.bucket, object, text)
        .then((_num) => resolve([]))
        .catch((err) => reject(err));
    });
  }

  async flushCollection(collection: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // this.sonicIngest.push(collection,bucket,text, {lang: 'en'})
      this.sonicIngest.flushc(collection)
        .then((_num) => resolve([]))
        .catch((err) => reject(err));
    });
  }
  async flushBucket(collection: string, bucket: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // this.sonicIngest.push(collection,bucket,text, {lang: 'en'})
      this.sonicIngest.flushb(collection, bucket)
        .then((_num) => resolve([]))
        .catch((err) => reject(err));
    });
  }
}
