import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'src/unused-routes/**/*',
      '**/test/**/*',
      '**/__tests__/**/*',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      'src/types/database.types.ts', // Generated Supabase types
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // === CRITICAL SECURITY RULES (Always Error) ===
      // These rules prevent security vulnerabilities and runtime crashes
      '@typescript-eslint/no-implied-eval': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-leaked-render': 'error',
      '@next/next/no-html-link-for-pages': 'error',

      // === RUNTIME CORRECTNESS (Error) ===
      // These rules prevent runtime errors and bugs
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-useless-empty-export': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/self-closing-comp': 'error',
      'no-return-assign': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'import/no-duplicates': 'error',

      // === DEVELOPMENT FRIENDLY RULES (Warn or Off) ===
      // These are style preferences that shouldn't block development

      // TypeScript style rules - relaxed for development velocity
      '@typescript-eslint/no-explicit-any': 'warn', // Allow during rapid prototyping
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // || vs ?? is developer preference
      '@typescript-eslint/no-unnecessary-condition': 'off', // Defensive programming is good
      '@typescript-eslint/no-inferrable-types': 'warn', // Explicit types can be documentation
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',

      // Promise handling - warn but don't block (developer judgment)
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/require-await': 'warn',

      // Code quality suggestions
      '@typescript-eslint/prefer-readonly': 'off', // Sometimes mutability is intentional
      'prefer-template': 'warn', // Suggestion not requirement

      // React rules
      'react/no-unescaped-entities': 'warn',
      'react/jsx-no-bind': 'off', // Arrow functions in JSX are fine for most use cases

      // Next.js suggestions
      '@next/next/no-img-element': 'warn',

      // Console statements - warn but allow (useful for development)
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Import organization - suggestions not requirements
      'import/order': 'off', // Auto-formatters handle this better
      'import/no-unused-modules': 'off', // Too noisy during development

      // Namespace handling for Express augmentation
      '@typescript-eslint/no-namespace': 'off',
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-namespace': 'off', // Declaration files need namespace
      '@typescript-eslint/no-explicit-any': 'off', // Type declarations may need any
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // More lenient in tests
      '@typescript-eslint/no-non-null-assertion': 'off', // Tests may need assertions
      'no-console': 'off', // Allow console in tests
    },
  },
  {
    files: ['src/middleware/**/*', 'src/routes/**/*'],
    rules: {
      '@typescript-eslint/no-misused-promises': 'off', // Express middleware needs promise handling
    },
  },
];

export default eslintConfig;
