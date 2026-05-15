(Bun.js + TypeScript)
# Change only requested file 
# Don't read more than 5 files
## General Principles
- Always follow existing folder structure strictly.
- Prefer small, simple, and explicit code over abstraction.
- Do not introduce new patterns unless already used in the codebase.
- Use TypeScript types everywhere (no `any` unless unavoidable).
- Keep functions under 40 lines when possible.

## Coding Rules

- Always use async/await (no `.then`)
- Always handle errors properly
- Use named exports only
- Use absolute imports if configured
- Avoid nested conditionals (max depth = 2)
## Naming Conventions

- controllers: `user.controller.ts`
- services: `user.service.ts`
- queries: `user.query.ts`
- validations: `user.validation.ts`