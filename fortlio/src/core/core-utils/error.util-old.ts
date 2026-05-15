
import { ZodError } from 'zod';
import { AxiosError } from 'axios';
type StackEntry = {
  apiName: string;
  msg?: string;
  debugValues?: Record<string, any>;
};
export class AppError extends Error {
  code: number;
  status: string;
  stackPath?: string[];
  errorStack?: any;

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

const parseJsonErrorArray = (message: string): any[] | null => {
  try {
    const parsed = JSON.parse(message);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const formatZodErrorMessage = (message: string): string => {
  const parsedArray = parseJsonErrorArray(message);
  if (!parsedArray) { return message; }
  return parsedArray.map((err: any) => err?.message || JSON.stringify(err)).join(', ');
};

const getErrorMessage = (error: any): string => {
  if (error instanceof ZodError) {
    return formatZodErrorMessage(error.message);
  }
  if (typeof error?.message === 'string') {
    return formatZodErrorMessage(error.message);
  }
  if (typeof error === 'string') {
    return formatZodErrorMessage(error);
  }
  return JSON.stringify(error);
};

const getErrorStack = (error: any): any => {
  // ✅ prefer structured stack if already built
  if (Array.isArray(error?.customStack) && error.customStack.length) {
    return error.customStack;
  }
  const message = error instanceof ZodError ? error.message : error?.message;
  if (typeof message === 'string') {
    const parsedArray = parseJsonErrorArray(message);
    if (parsedArray) { return parsedArray; }
  }
  return error instanceof Error
    ? (error.stack || '').replace(/\s+/g, ' ')
    : undefined;
};

const safeStringify = (value: any): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return '"[Circular/Object]"';
  }
};

const toSingleLine = (value: any): string => {
  if (value === null || value === undefined) { return ''; }
  return String(value).replace(/\s+/g, ' ').trim();
};

const buildLogLine = (errorMessage: string, customStack: any[], errorStack?: string) => [
  `ERROR_CODE:${}`,
  `MESSAGE:${toSingleLine(errorMessage)}`,
  `STACK:${toSingleLine(safeStringify(customStack))}`,
  errorStack ? `ERROR_STACK:${toSingleLine(errorStack)}` : null,
].filter(Boolean).join(' | ');

export function fmtErr(error: any, stackEntry: StackEntry): any {
  const errorMessage = getErrorMessage(error);
  // const errorStack = getErrorStack(error);
  if (!error.customStack) { error.customStack = []; }
  error.customStack.push({
    apiName,
    msg: stackEntry?.msg || errorMessage,
    debugValues: stackEntry?.debugValues || {},
  });
  // error.fromLower = true;
  return error;
}

export function fmtPrntError(error: any, stackEntry: StackEntry): AppError {
  const errorMessage = getErrorMessage(error);
  const errorStack = getErrorStack(error);

  if (!error.customStack) { error.customStack = []; }

  // ✅ prepend instead of append
  error.customStack.unshift({
    apiName: stackEntry?.apiName,
    msg: stackEntry?.msg || errorMessage,
    debugValues: stackEntry?.debugValues || {},
  });

  const fullError = buildLogLine(stackEntry.apiName, errorMessage, error.customStack, errorStack);
  console.error('-----------------------------------------');
  console.error(fullError);
  console.error('-----------------------------------------');

  return new AppError(errorMessage, 500, 'error', {
    stackPath: error.customStack,
    errorStack,
  });
}
