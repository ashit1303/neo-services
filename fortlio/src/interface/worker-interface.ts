import { PipelineStage } from 'mongoose';
import { Config } from './common.interface';

export interface WorkerData {
  dbType: 'mongodb' | 'clickhouse';
  fileName: string;
  collectionName?: string;
  tableName?: string;
  pipeline?: PipelineStage[];
  query?: string;
  params?: Record<string, any>;
  userId: string;

}

export interface WorkerDataConfig {
  dbType: 'mongodb' | 'clickhouse';
  config: Config;
  fileName: string;
  collectionName?: string;
  tableName?: string;
  pipeline?: PipelineStage[];
  query?: string;
  params?: Record<string, any>;
  userId: string;
}

export interface WorkerResponse {
  SUCCESS: boolean;
  message?: string;
  url?: string;
  userId?: string;
  error?: string;
}