/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  
  // Simplified transform configuration
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          target: 'es2018',
          module: 'commonjs',
          strict: false,
          skipLibCheck: true,
        },
      },
    ],
  },
  
  // Coverage collection
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/test/**',
    '!src/**/index.ts',
    '!src/test/**',
  ],
  
  // Realistic coverage thresholds for professional environment
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Path mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Test setup
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  
  // Test environment configuration
  testTimeout: 60000,
  maxWorkers: 1,
  
  // Coverage reporting
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  
  // Simplified configuration for reliability
  verbose: false,
};
