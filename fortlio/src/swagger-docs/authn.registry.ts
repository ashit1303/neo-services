import { openApiRegistry } from '../clients';
import { LogoutValidation, SendOtpValidation, VerifyOtpValidation } from '../validations/authn-validation';
import { EmailValidation } from '../validations/common-validation';

export function registerAuthnRoutes() {
  openApiRegistry.register('EmailValidation', EmailValidation);
  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Authn'],
    path: '/auth/sendOtp',
    request: { query: SendOtpValidation },
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
    method: 'post',
    tags: ['Authn'],
    path: '/auth/verifyOtp',
    request: { body: { content: { 'application/json': { schema: VerifyOtpValidation } } } },
    responses: { 200: { description: 'Authn: Successfully verified OTP' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Authn'],
    path: '/auth/authenticate/',
    responses: { 200: { description: 'Authn: Successfully authenticated' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Authn'],
    path: '/auth/refreshToken',
    responses: { 200: { description: 'Authn: Successfully refreshed token' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Authn'],
    path: '/auth/logout',
    request: { query: LogoutValidation },
    responses: { 200: { description: 'Authn: Successfully logged out' } },
  });

}