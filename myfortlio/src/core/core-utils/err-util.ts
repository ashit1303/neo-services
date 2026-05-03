
import { ZodError } from 'zod';

type StackEntry = {
  apiName: string;
  msg?: string;
  debugValues?: Record<string, any>;
};

type WrappedError = {
  error: Error;
  customStack: StackEntry[];
};

import { AxiosError } from 'axios';

type AxiosDebug = { url?: string; method?: string; status?: number; responseData?: any; params?: any; requestData?: any; };

const extractAxiosDetails = (error: AxiosError): AxiosDebug => ({
  url: error.config?.url,
  method: error.config?.method,
  status: error.response?.status,
  responseData: error.response?.data,
  params: error.config?.params,
  requestData: error.config?.data,
});

export class AppError extends Error {
  code: number;
  status: string;
  stackPath?: StackEntry[];
  errorStack?: string;

  constructor(message: string, code = 500, status = 'error', extra?: any) {
    super(message);
    this.code = code;
    this.status = status;

    if (extra) {
      this.stackPath = extra.stackPath;
      this.errorStack = extra.errorStack;
    }
  }
}

// ✅ Normalize any input into a proper Error
const normalizeError = (err: any): Error => {
  if (err instanceof Error) { return err; }
  return new Error(typeof err === 'string' ? err : JSON.stringify(err));
};

// ✅ Extract message safely
const getErrorMessage = (error: any): string => {
  if (error instanceof ZodError) {
    return error.issues.map(e => e.message).join(', ');
  }
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ||
      error.message ||
      'Axios request failed'
    );
  }
  if (typeof error?.message === 'string') {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return JSON.stringify(error);
};

// ✅ Keep original stack untouched
const getErrorStack = (error: Error): string => (error.stack || '').replace(/\s+/g, ' ');

// ✅ Safe stringify
const safeStringify = (value: any): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return '"[Circular/Object]"';
  }
};

// ✅ Single-line formatter
const toSingleLine = (value: any): string => {
  if (value === null || value === undefined) { return ''; }
  return String(value).replace(/\s+/g, ' ').trim();
};

// ✅ Build log line
const buildLogLine = (apiName: string, errorMessage: string, customStack: StackEntry[], errorStack: string) => [
  `ERROR_CODE:${apiName} `,
  `MESSAGE:${toSingleLine(errorMessage)} `,
  `STACK:${safeStringify(customStack)} `,
  `ERROR_STACK:${toSingleLine(errorStack)} `,
].join(' | ');

export function fmtErr(input: any, stackEntry: StackEntry): WrappedError {
  const isWrapped = input?.error && input?.customStack;

  const baseError = isWrapped ? input.error : normalizeError(input);

  // ✅ extract axios debug if applicable
  let debugValues = stackEntry.debugValues || {};

  if (baseError instanceof AxiosError) {
    debugValues = {
      ...debugValues,
      axios: extractAxiosDetails(baseError),
    };
  }

  const entry: StackEntry = {
    apiName: stackEntry.apiName,
    msg: stackEntry.msg || getErrorMessage(baseError),
    debugValues,
  };

  if (isWrapped) {
    input.customStack.push(entry);
    return input;
  }

  return {
    error: baseError,
    customStack: [entry],
  };
}

// ✅ Final formatter (top-level only)
export function fmtPrntErr(input: any, statusCode = 500, stackEntry: StackEntry): AppError {
  const wrapped = fmtErr(input, stackEntry);

  const errorMessage = getErrorMessage(wrapped.error);
  const errorStack = getErrorStack(wrapped.error);

  const fullError = buildLogLine(
    stackEntry.apiName,
    errorMessage,
    wrapped.customStack,
    errorStack,
  );

  console.error('-----------------------------------------');
  console.error(fullError);
  console.error('-----------------------------------------');

  return new AppError(errorMessage, statusCode, 'error', {
    stackPath: wrapped.customStack,
    errorStack,
  });
}

