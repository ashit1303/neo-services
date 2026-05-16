import { APP_ENVIRONMENTS } from '../core/core-constants/enum.constants';

export interface Error {
    message: string
    code: number
    status: string
    timestamp: string
}

export interface AuthError {
    errors: Error[]
    data: any
}

export interface IFilter {
    isDownload?: boolean;
    page?: string;
    pageSize?: string;
    skip?: number;
    limit?: number;
    fromDate?: string;
    toDate?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface DatabaseConfig {
    cluster: string;
    password: string;
    username: string;
    dbName: string;
}

export interface Config {
    awsSecretName: string;
    awsRegion: string;
    env: string;
    appEnv: APP_ENVIRONMENTS;
    port: number;
    checksumSecret?: string;
}

export interface PopulateData {
    collectionName: string;
    localField: string;
    foreignField: string;
    fieldAssertion: string;
}

// export interface IAnalyticsFilter {
//     isDownload?: boolean;
//     page?: number;
//     pageSize?: number;
//     fromDate?: string;
//     toDate?: string;
//     search?: string;
//     sortBy?: string;
//     sortOrder?: 'asc' | 'desc';
//     filterKey?: Object;
// }

export interface PaginationMeta {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
}