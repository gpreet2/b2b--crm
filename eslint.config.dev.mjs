// Development-focused ESLint rules that allow for faster iteration
// Only critical security and runtime errors are flagged
// Use this config during active development for better velocity

export default {
  extends: ['./eslint.config.mjs'],
  rules: {
    // Turn off all style preference rules for development speed
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-redundant-type-constituents': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    
    // Turn off promise rules that are often false positives during development
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/require-await': 'off',
    
    // Turn off minor quality rules
    '@typescript-eslint/prefer-readonly': 'off',
    '@typescript-eslint/prefer-string-starts-ends-with': 'off',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
    '@typescript-eslint/no-useless-empty-export': 'off',
    'prefer-template': 'off',
    'object-shorthand': 'off',
    'prefer-arrow-callback': 'off',
    
    // Turn off React style rules
    'react/no-unescaped-entities': 'off',
    'react/jsx-no-bind': 'off',
    'react/jsx-no-useless-fragment': 'off',
    'react/self-closing-comp': 'off',
    
    // Turn off Next.js style rules
    '@next/next/no-img-element': 'off',
    
    // Allow console statements during development
    'no-console': 'off',
    
    // Turn off minor code quality rules
    'no-return-assign': 'off',
    'no-sequences': 'off',
    'no-throw-literal': 'off',
    'no-unmodified-loop-condition': 'off',
    'no-unused-expressions': 'off',
    'no-useless-concat': 'off',
    'no-useless-return': 'off',
    
    // Turn off import organization rules (let formatters handle this)
    'import/order': 'off',
    'import/no-duplicates': 'off',
    'import/no-unused-modules': 'off',
  },
};