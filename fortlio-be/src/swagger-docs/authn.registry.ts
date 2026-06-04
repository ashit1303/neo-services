import z from 'zod';
import { openApiRegistry } from '../clients';

export function registerAuthnRoutes() {
  openApiRegistry.registerPath({
    method: 'post',
    tags: ['Authn'],
    path: '/auth/register',
    request: {
      body: { content: { 'application/json': { schema: z.object({ email: z.string().email(), password: z.string(), fullName: z.string() }) } } },
    },
    responses: { 200: { description: 'Successfully registered and verification email sent' } },
  });

  openApiRegistry.registerPath({
    method: 'post',
    tags: ['Authn'],
    path: '/auth/login',
    request: {
      body: { content: { 'application/json': { schema: z.object({ email: z.string().email(), password: z.string() }) } } },
    },
    responses: { 200: { description: 'Successfully logged in' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Authn'],
    path: '/auth/verifyEmail',
    request: { query: z.object({ token: z.string() }) },
    responses: { 200: { description: 'Email verified successfully' } },
  });

  openApiRegistry.registerPath({
    method: 'post',
    tags: ['Authn'],
    path: '/auth/resendVerification',
    request: {
      body: {
        content: { 'application/json': { schema: z.object({ email: z.string().email() }) } },
      },
    },
    responses: { 200: { description: 'Verification email sent' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Authn'],
    path: '/auth/refreshToken',
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: 'Successfully refreshed token' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Authn'],
    path: '/auth/logout',
    request: {
      query: z.object({
        userId: z.string(),
      }),
    },
    responses: { 200: { description: 'Successfully logged out' } },
  });
}