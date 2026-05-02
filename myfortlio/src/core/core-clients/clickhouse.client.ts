// npm install @clickhouse/client

import { createClient, ClickHouseClient as CHClient } from '@clickhouse/client';
import { Config, PaginationMeta } from '../../interface';
import { DatabaseConfigManager } from './all-db-config';

export class ClickHouseClient {
  private client?: CHClient;
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private async create(): Promise<CHClient> {
    const chConfig = await new DatabaseConfigManager(this.config).getClickHouseConfig();

    return createClient({
      url: chConfig.cluster,              // e.g. http://localhost:8123
      username: chConfig.username,
      password: chConfig.password,
      database: chConfig.dbName,

      // Important for analytics
      compression: {
        response: true,
        request: true,
      },

      // Good defaults
      request_timeout: 60_000,
      max_open_connections: 10,
    });
  }

  async connectCHLogs(): Promise<CHClient> {
    if (!this.client) {
      this.client = await this.create();
      console.info('✅ ClickHouse Client Connected Successfully');
    }
    return this.client;
  }

  /**
   * Preferred helper:
   * - Executes query
   * - Returns destructured JSON rows
   */
  async query<T = any>(
    sql: string,
    params?: Record<string, any>,
  ): Promise<T[]> {
    const client = await this.connectCHLogs();

    const resultSet = await client.query({
      query: sql,
      query_params: params,
      format: 'JSONEachRow',
    });

    return resultSet.json<T>();
  }

  async execute(sql: string, params?: Record<string, any>): Promise<{ writtenRows?: string; writtenBytes?: string; }> {
    const client = await this.connectCHLogs();

    const resultSet = await client.command({
      query: sql,
      query_params: params,
    });

    return {
      writtenRows: resultSet.summary?.written_rows,
      writtenBytes: resultSet.summary?.written_bytes,
    };
  }

  //https://clickhouse.com/docs/sql-reference/aggregate-functions/reference/count
  async paginateMeta(query: string, params: Record<string, any>, skip: number, limit: number): Promise<PaginationMeta> {
    const strippedQuery = ClickHouseClient.stripOrderLimitOffset(query);

    const countQuery = `
    SELECT count() AS totalCount
    FROM (
      ${strippedQuery}
    ) AS sub
  `;

    const result = await this.query(countQuery, params);
    const totalCount = Number(result[0]?.totalCount ?? 0);

    const currentPage = Math.floor(skip / limit) + 1;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      totalCount,
      currentPage,
      totalPages,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages,
    };
  }

  static stripOrderLimitOffset(sql: string): string {
    return sql
      // Remove ORDER BY ... before LIMIT or end of string
      .replace(/order\s+by[\s\S]*?(?=(limit|$))/gi, '')
      // Remove LIMIT ... optionally followed by OFFSET ..., including placeholders
      .replace(/limit\s+[^\s;]+(\s+offset\s+[^\s;]+)?/gi, '')
      // Remove SETTINGS clause
      .replace(/settings\s+[\s\S]*$/gi, '')
      // Remove trailing semicolons
      .replace(/;$/g, '')
      .trim();
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = undefined;
      console.info('📡 ClickHouse Client Connection Closed');
    }
  }
}
