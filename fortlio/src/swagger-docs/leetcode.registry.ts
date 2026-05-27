import { openApiRegistry } from '../clients';
import { ExplainValidation, SearchValidation } from '../validations/leetcode-validation';

export function registerLeetcodeRoutes() {
  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Leetcode'],
    path: '/services/leetcode/explain',
    security: [{ bearerAuth: [] }],
    request: { query: ExplainValidation },
    responses: { 200: { description: 'Problem explanation fetched' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Leetcode'],
    path: '/services/leetcode/search',
    security: [{ bearerAuth: [] }],
    request: { query: SearchValidation },
    responses: { 200: { description: 'Search results fetched' } },
  });

}