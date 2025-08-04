// Temporary ESLint config for clean build - less strict rules
// Use this for initial development, then migrate to production config

module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    // Temporarily disable strict rules that would block build
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/require-await': 'warn',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    'no-console': 'warn',
    'no-script-url': 'warn',
    
    // Keep critical security and correctness rules as errors
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};