
import { ZodError } from 'zod';
import { AxiosError } from 'axios';

type StackEntry = {
  apiName: string;
  msg?: string;
  debugValues?: Record<string, any>;
};
export class CustomError extends Error {
  actualError?: Error;
  stackEntry?: StackEntry;
  axiosPayload?: AxiosDebug;
  status?: number;
  userMessage?: string;

  constructor(actualError: Error, message: string, status = 500) {
    super(message);
    this.name = 'CustomError';
    this.status = status;
    this.actualError = actualError;
  }
}

type AxiosDebug = { url?: string; method?: string; status?: number; responseData?: any; params?: any; requestData?: any; };

const extractAxiosDetails = (error: AxiosError): AxiosDebug => ({
  url: error.config?.url,
  method: error.config?.method,
  status: error.response?.status,
  responseData: error.response?.data,
  params: error.config?.params,
  requestData: error.config?.data,
});

export function fmtErr(inputErr: any, stackEntry: StackEntry): CustomError {
  inputErr.stackEntry ? inputErr.stackEntry.push(stackEntry) : inputErr.stackEntry = [stackEntry];
  if (inputErr instanceof ZodError) {
    inputErr.message = inputErr.issues.map(e => e.message).join(', ');
  }
  let axiosError;
  if (inputErr instanceof AxiosError) {
    axiosError = extractAxiosDetails(inputErr);
  }
  if (axiosError) {
    inputErr.axiosPayload = axiosError;
  }
  return inputErr;
}

// ✅ Final formatter (top-level only)
export function fmtPrntErr(input: any, statusCode = 500, stackEntry: StackEntry): CustomError {
  const finalError = fmtErr(input, stackEntry);
  const customErr = new CustomError(input, finalError.message, statusCode);

  // customErr.stackEntry = finalError.stackEntry;
  // customErr.axiosPayload = finalError.axiosPayload;
  customErr.actualError = input;
  customErr.userMessage = stackEntry.msg;

  console.error('---------------------START---------------------');
  console.error(JSON.stringify({
    API_NAME: stackEntry.apiName,
    MESSAGE: finalError.message,
    ERROR: customErr,
    STATUS: statusCode,
  }));
  console.error('--------------------ORIGINAL OUTPUT---------------------');
  console.error(input);
  console.error('---------------------END---------------------');

  return customErr;
}
