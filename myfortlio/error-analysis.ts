throw fmtErr(error, [{ msg: 'Failed to fetch data by filter query', apiName: 'runQueryMongoDriverSecondary', debugValues: { collectionName, basepipeline } }]);
i want to format error like this 

Now a() callled b() -> c() -> d() and error is thrown in d() then i want to format error like this
[{ apiName: 'd', msg: '', debugValues: {} }, { apiName: 'c', msg: '', debugValues: {} }, { apiName: 'b', msg: '', debugValues: {} }, { apiName: 'a', msg: '', debugValues: {} }] with 0 from where error was first thrown and then all the way up to the first caller.I want to maintain this stack in customStack property of error object and when i call fmtErr it should format the error message in the way i mentioned above.I also want to maintain the original error message and stack trace in the error object.

OR like this
{ "0": { apiName: 'd', msg: '', debugValues: { } }, "1": { apiName: 'c', msg: '', debugValues: { } }, "2": { apiName: 'b', msg: '', debugValues: { } } , "3": { apiName: 'a', msg: '', debugValues: { } } }


import { ZodError } from 'zod';
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
  const message = error instanceof ZodError ? error.message : error?.message;
  if (typeof message === 'string') {
    const parsedArray = parseJsonErrorArray(message);
    if (parsedArray) { return parsedArray; }
  }
  return error instanceof Error ? (error.stack || '').replace(/\s+/g, ' ') : undefined;
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

const buildLogLine = (apiName: string, errorMessage: string, customStack: any[], errorStack?: string) => [
  `ERROR_CODE:${apiName}`,
  `MESSAGE:${toSingleLine(errorMessage)}`,
  `STACK:${toSingleLine(safeStringify(customStack))}`,
  errorStack ? `ERROR_STACK:${toSingleLine(errorStack)}` : null,
].filter(Boolean).join(' | ');

function fmtErr(error: any, stack: string[], apiName: string): any {
  const errorMessage = getErrorMessage(error);
  const errorStack = getErrorStack(error);
  if (!error.customStack) { error.customStack = []; }
  error.customStack.push(...stack);
  error.fromLower = true;
  const fullError = buildLogLine(apiName, errorMessage, error.customStack, errorStack);
  console.error('-----------------------------------------');
  console.error(fullError);
  console.error('-----------------------------------------');

  return error;
}

function fmtPrntError(error: any, stack: string[], apiName: string): AppError {
  const errorMessage = getErrorMessage(error);
  const errorStack = getErrorStack(error);
  if (!error.customStack) { error.customStack = []; }
  error.customStack.push(...stack);
  const fullError = buildLogLine(apiName, errorMessage, error.customStack, errorStack);
  console.error(fullError);
  return new AppError(errorMessage, 500, 'error', { stackPath: error.customStack, errorStack });
}
