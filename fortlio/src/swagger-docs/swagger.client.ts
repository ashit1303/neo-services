import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { openApiRegistry } from '../clients';
import { registerUserRoutes } from './user.registry';

// export const registry = new openApiRegistry();
registerUserRoutes();

export function generateOpenApiDocs() {
  const generator = new OpenApiGeneratorV3(openApiRegistry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: { title: 'Fortlio API', version: '1.0.0' },
  });
}