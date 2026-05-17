import z from 'zod';

export const ExplainValidation = z.object({
  url: z.string().url(),
  codelang: z.string(),
});

export const SearchValidation = z.object({
  searchKey: z.string(),
});