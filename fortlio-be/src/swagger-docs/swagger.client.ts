import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { backendBaseURL, openApiRegistry } from '../clients';
import { registerUserRoutes } from './user.registry';
import { registerRoleRoutes } from './role.registry';
import { registerAuthnRoutes } from './authn.registry';
import { registerShortenerRoutes } from './shorten.registry';
import { registerLeetcodeRoutes } from './leetcode.registry';
import { registerCandidateRoutes } from './candidate.registry';
import { registerHrRoutes } from './hr.registry';
import { registerConnectionRoutes } from './connection.registry';

openApiRegistry.registerComponent('securitySchemes', 'bearerAuth', { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' });

// Register routes here
registerAuthnRoutes();
registerCandidateRoutes();
registerHrRoutes();
registerConnectionRoutes();
registerLeetcodeRoutes();
registerUserRoutes();
registerRoleRoutes();
registerShortenerRoutes();

export function generateOpenApiDocs() {
  const generator = new OpenApiGeneratorV3(openApiRegistry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: { title: 'Fortlio API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:4020', description: 'Local server' }, { url: backendBaseURL, description: 'Live server' }],
  });
}