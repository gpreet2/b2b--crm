// Test setup file
// Use Object.defineProperty to set NODE_ENV for tests
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: true,
  enumerable: true,
  configurable: true
});

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};