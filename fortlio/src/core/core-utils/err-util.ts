// import { AxiosError } from 'axios';
import { ZodError } from 'zod';

export type StackEntry = {
  apiName: string;
  msg?: string;
  debugValues?: Record<string, any>;
};

export class AppError extends Error {
  statusCode: number;
  stackJourney: StackEntry[] = [];
  userMessage?: string;
  error?: unknown;
  // axiosDebug?: any;

  constructor(
    message: string,
    opts?: { msg?: string; apiName?: string; debugValues?: Record<string, any>; error?: unknown; },
    statusCode?: number,

  ) {
    super(message);

    this.statusCode = statusCode ?? 500;
    this.error = opts?.error;
    this.userMessage = opts?.msg || message;
    if (opts?.apiName) {
      this.stackJourney.push({
        apiName: opts.apiName,
        msg: opts.msg,
        debugValues: opts.debugValues,
      });
    }
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace?.(this, this.constructor);

    this.enrich();
    this.name = 'AppError';
    // 3. optional auto log (ONLY if statusCode is explicitly provided)
    if (statusCode) {
      this.log();
    }
  }

  // -----------------------------
  // STACK JOURNEY BUILDER
  // -----------------------------
  // private buildStackJourney(entry?: StackEntry | StackEntry[]) {
  //   if (!entry) { return; }

  //   if (Array.isArray(entry)) {
  //     this.stackJourney.push(...entry);
  //   } else {
  //     this.stackJourney.push(entry);
  //   }
  // }

  // -----------------------------
  // AUTO TYPE ENRICHMENT
  // -----------------------------
  private enrich() {
    const err: any = this.error;

    if (!err) { return; }

    // ✅ Zod handling
    if (err instanceof ZodError) {
      this.message = err.issues.map(e => e.message).join(', ');
    }

    // 
    // if (err instanceof AxiosError) {
    //   this.message = err.message;
    //   this.error = {
    //     message: err.message,
    //     url: err.config?.url,
    //     method: err.config?.method,
    //     status: err.response?.status,
    //     responseData: err.response?.data,
    //     params: err.config?.params,
    //     requestData: err.config?.data,
    //   };
    // }
  }

  // -----------------------------
  // OPTIONAL: add more context internally (no external calls needed)
  // -----------------------------
  addInternalContext(entry: StackEntry) {
    this.stackJourney.push(entry);
    return this;
  }

  // -----------------------------
  // LOGGER (single source of truth)
  // -----------------------------
  log() {
    console.error('--------------- ERROR TRACE START ---------------');

    console.error(
      JSON.stringify({ message: this.message, statusCode: this.statusCode, stackJourney: this.stackJourney, stack: this.stack, error: this.error }),
    );

    console.error('--------------- ERROR TRACE END -----------------');
  }
}