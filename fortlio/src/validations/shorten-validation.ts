import z from 'zod';

export const ShortItValidation = z.object({ originalUrl: z.string().url(), customAlias: z.string().optional() });

export const ShortValueValidation = z.object({ shortValue: z.string() });

export const IsKeyAvailableValidation = z.object({ alias: z.string() });
