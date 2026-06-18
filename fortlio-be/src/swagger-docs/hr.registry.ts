import { openApiRegistry } from '../clients';
import { HrProfileUpsertValidation, HrProfileParamsValidation } from '../validations/hr-validation';

export function registerHrRoutes() {
  openApiRegistry.registerPath({
    method: 'post',
    tags: ['HR'],
    path: '/hr/profile',
    security: [{ bearerAuth: [] }],
    request: { body: { content: { 'application/json': { schema: HrProfileUpsertValidation } } } },
    responses: { 200: { description: 'HR profile upserted successfully' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['HR'],
    path: '/hr/profile/{userId}',
    request: { params: HrProfileParamsValidation },
    responses: { 200: { description: 'HR profile details fetched' } },
  });
  openApiRegistry.registerPath({
    method: 'get',
    tags: ['HR'],
    path: '/hr/history/viewed-profiles',
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: 'Recently viewed profiles retrieved successfully' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['HR'],
    path: '/hr/history/searches',
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: 'Recent searches retrieved successfully' } },
  });
}
