import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

export const formatErrorMessage = (error: any | Error, statusCode: StatusCodes, details: Record<string, any>): any => {
  console.info('-----------------------------------------');
  console.info(error);
  console.info('-----------------------------------------');

  if (error instanceof ZodError) {
    const errorArr = JSON.parse(error.message);
    details.code = details.code;
    details.msg = errorArr.map((err: any) => err.message);
  }
  return errorHandler(error, details);

};

export const errorHandler = (error: any | Error, details: Record<string, any>) => {
  // if (process.env.BUN_ENV !== 'prod') {
  console.info('-----------------------------------------');
  console.info(error.message);
  console.info(error.path, error.locations);
  console.info(error.extensions);
  console.info(error.source);
  console.info(error.originalError?.message, error.originalError?.stack);
  console.info('-----------------------------------------');
  // }
  return {
    message: details.msg || error.message,
    code: error.code,
    status: 'error',
    timestamp: new Date().toISOString(),
  };
};
