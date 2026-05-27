import z from 'zod';
import { openApiRegistry } from '../clients';
import { EmailValidation, FilterQueryValidation } from '../validations/common-validation';
import { UserCreateValidation, UserIdValidation, UserUpdateValidation } from '../validations/user-validation';

export function registerUserRoutes() {
  openApiRegistry.register('EmailValidation', EmailValidation);

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Users'],
    path: '/user/getUsers',
    security: [{ bearerAuth: [] }],
    request: { query: FilterQueryValidation },
    responses: { 200: { description: 'Users fetched' } },
  });

  openApiRegistry.registerPath({
    method: 'get',
    tags: ['Users'],
    path: '/user/getUserById/',
    security: [{ bearerAuth: [] }],
    request: { body: { content: { 'application/json': { schema: UserCreateValidation } } } },
    responses: { 200: { description: 'User fetched by ID' } },
  });

  openApiRegistry.registerPath({
    method: 'post',
    tags: ['Users'],
    path: '/user/createUser',
    security: [{ bearerAuth: [] }],
    request: { body: { content: { 'application/json': { schema: UserUpdateValidation } } } },
    responses: { 201: { description: 'User created' } },
  });

  openApiRegistry.registerPath({
    method: 'put',
    tags: ['Users'],
    path: '/user/updateUserById/{userId}',
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ userId: UserIdValidation }) },
    responses: { 200: { description: 'User updated' } },
  });

  openApiRegistry.registerPath({
    method: 'delete',
    tags: ['Users'],
    path: '/user/deleteUserById/{userId}', // ✅ correct
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ userId: UserIdValidation }) },
    responses: { 204: { description: 'User deleted' } },
  });
}
// export function registerUserRoutes() {
//   openApiRegistry.register('EmailValidation', EmailValidation);

//   openApiRegistry.registerPath({
// //     method: 'get',
// tags: ['Users'],//     
//   path: '/user/getUsers',

//     summary: 'Get all users',
//     description: 'Fetch a list of users with optional filters applied',

//     operationId: 'getUsers',

//     tags: ['Users'],

//     parameters: [
//       {
//         name: 'page',
//         in: 'query',
//         required: false,
//         description: 'Page number for pagination',
//         schema: z.coerce.number().min(1).openapi({
//           example: 1,
//         }),
//       },
//       {
//         name: 'limit',
//         in: 'query',
//         required: false,
//         description: 'Number of users per page',
//         schema: z.coerce.number().min(1).max(100).openapi({
//           example: 10,
//         }),
//       },
//       {
//         name: 'search',
//         in: 'query',
//         required: false,
//         description: 'Search users by name or email',
//         schema: z.string().openapi({
//           example: 'john',
//         }),
//       },
//     ],

//     responses: {
//       200: {
//         description: 'Users fetched successfully',
//         content: {
//           'application/json': {
//             schema: z.object({
//               success: z.boolean().openapi({ example: true }),
//               data: z.array(
//                 z.object({
//                   id: z.string().openapi({
//                     example: 'user_123',
//                     description: 'Unique user ID',
//                   }),
//                   name: z.string().openapi({
//                     example: 'John Doe',
//                   }),
//                   email: z.string().email().openapi({
//                     example: 'john@example.com',
//                   }),
//                   status: z.boolean().openapi({
//                     example: true,
//                   }),
//                   createdAt: z.string().datetime().openapi({
//                     example: '2024-01-01T12:00:00Z',
//                   }),
//                 }),
//               ),
//               pagination: z.object({
//                 page: z.number().openapi({ example: 1 }),
//                 limit: z.number().openapi({ example: 10 }),
//                 total: z.number().openapi({ example: 100 }),
//               }),
//             }),
//           },
//         },
//       },

//       400: {
//         description: 'Invalid request parameters',
//         content: {
//           'application/json': {
//             schema: z.object({
//               success: z.boolean().openapi({ example: false }),
//               message: z.string().openapi({
//                 example: 'Invalid query params',
//               }),
//             }),
//           },
//         },
//       },

//       401: {
//         description: 'Unauthorized access',
//       },

//       500: {
//         description: 'Internal server error',
//       },
//     },

//     security: [
//       {
//         bearerAuth: [],
//       },
//     ],
//   });
// }