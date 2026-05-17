import { openApiRegistry } from '../clients';
import { EmailValidation, FilterQueryValidation } from '../validations/common-validation';

export function registerAuthnRoutes() {
  openApiRegistry.register('EmailValidation', EmailValidation);
  //sendOtp
  //resendOtp
  //verifyOtp
  //authenticate
  //refreshToken
  //logout
  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Authn'],
    path: '/auth/sendOtp',
    request: { query: EmailValidation },
    responses: { 200: { description: 'Authn fetched' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Authn'],
    path: '/auth/resendOtp',
    request: { query: EmailValidation },
    responses: { 200: { description: 'Authn: Successfully resent OTP' } },
  });
  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Authn'],
    path: '/auth/verifyOtp',
    request: { query: FilterQueryValidation },
    responses: { 200: { description: 'Authn: Successfully verified OTP' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Authn'],
    path: '/auth/authenticate/',
    request: { body: { content: { 'application/json': { schema: FilterQueryValidation } } } },
    responses: { 200: { description: 'Authn: Successfully authenticated' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Authn'],
    path: '/auth/refreshToken',
    request: { body: { content: { 'application/json': { schema: FilterQueryValidation } } } },
    responses: { 200: { description: 'Authn: Successfully refreshed token' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Authn'],
    path: '/auth/logout',
    request: { body: { content: { 'application/json': { schema: FilterQueryValidation } } } },
    responses: { 200: { description: 'Authn: Successfully logged out' } },
  });

}