import { openApiRegistry } from '../clients';
import { CandidateProfileUpsertValidation, CandidateBlogCreateValidation, CandidateSearchValidation, CandidateProfileParamsValidation } from '../validations/candidate-validation';
import { FilterQueryValidation } from '../validations/common-validation';

export function registerCandidateRoutes() {
  openApiRegistry.registerPath({
    method: 'post',
    tags: ['Candidates'],
    path: '/candidate/profile',
    security: [{ bearerAuth: [] }],
    request: { body: { content: { 'application/json': { schema: CandidateProfileUpsertValidation } } } },
    responses: { 200: { description: 'Candidate profile upserted successfully' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Candidates'],
    path: '/candidate/profile/{userId}',
    request: { params: CandidateProfileParamsValidation },
    responses: { 200: { description: 'Candidate profile details fetched (masked if not HR/Admin/self)' } },
  });

  openApiRegistry.registerPath({
    method: 'post',
    tags: ['Candidates'],
    path: '/candidate/blog',
    security: [{ bearerAuth: [] }],
    request: { body: { content: { 'application/json': { schema: CandidateBlogCreateValidation } } } },
    responses: { 201: { description: 'Candidate blog post created successfully' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Candidates'],
    path: '/candidate/blogs',
    request: { query: FilterQueryValidation },
    responses: { 200: { description: 'Candidate blogs list fetched' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Candidates'],
    path: '/candidate/search',
    request: { query: CandidateSearchValidation },
    responses: { 200: { description: 'Candidate search results fetched' } },
  });
}
