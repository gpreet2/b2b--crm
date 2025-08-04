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
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // TypeScript specific rules - Enhanced for production
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'error',
      '@typescript-eslint/no-redundant-type-constituents': 'error',

      // Security rules
      '@typescript-eslint/no-implied-eval': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',

      // Code quality rules
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
      '@typescript-eslint/no-useless-empty-export': 'error',

      // React specific rules
      'react/no-unescaped-entities': 'warn',
      'react/jsx-key': 'error',
      'react/jsx-no-bind': ['warn', { allowArrowFunctions: true }],
      'react/jsx-no-leaked-render': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/self-closing-comp': 'error',

      // Next.js specific
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'error',

      // General JavaScript rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-return-assign': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',

      // Import/Export rules for better organization
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-unused-modules': 'warn',

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
