# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

src/
├── api/            
├── assets/         # CSS and local UI SVGs (NOT public images)
├── components/     # UI Parts (Common, Layouts)
├── hooks/          # Logical functions (Custom React Hooks)
├── types/          # Global TypeScript interfaces
├── utils/          # Helpers (Formatting, Math)
public/             # Global images, favicons, robots.txt

src/
│
├── api/              # Only Axios/Fetch instances & API definitions
├── assets/           # imported images/icons
├── components/       # reusable UI
├── features/         # business modules
├── hooks/            # custom hooks
├── layouts/          # app layouts
├── lib/              # utilities/config
├── pages/            # route pages
├── routes/           # router config
├── services/         # business logic
├── store/            # Zustand/Redux
├── styles/           # global styles
├── types/            # TS types/interfaces
├── utils/            # pure helper functions (Formatting, Math)
└── main.tsx
.env                # Environment variables


i have my backend ready now i want to learn reactjs but with bunjs 
so i want to learn it the best way in ts to keep api calls | envs | logical functions | 
assets images and rules so that no one can put images or files in any other folders except public