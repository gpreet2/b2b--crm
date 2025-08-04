import * as Sentry from '@sentry/node';

import {
  initializeSentry,
  captureException,
  captureMessage,
  setUser,
  setContext,
  addBreadcrumb,
  startTransaction,
} from '../sentry';

// Mock Sentry
jest.mock('@sentry/node', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
  addBreadcrumb: jest.fn(),
  lastEventId: jest.fn().mockReturnValue('mock-event-id'),
  withScope: jest.fn(callback => {
    const scope = {
      setContext: jest.fn(),
    };
    callback(scope);
  }),
  Handlers: {
    errorHandler: jest
      .fn()
      .mockReturnValue((err: unknown, req: unknown, res: unknown, next: unknown) => next),
    requestHandler: jest.fn().mockReturnValue((req: unknown, res: unknown, next: unknown) => next),
  },
  startSpan: jest.fn().mockReturnValue({}),
}));

describe('Sentry Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('initializeSentry', () => {
    it('should not initialize without DSN', () => {
      delete process.env.SENTRY_DSN;
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      initializeSentry();

      expect(consoleSpy).toHaveBeenCalledWith('Sentry DSN not provided. Error tracking disabled.');
      expect(Sentry.init).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should initialize with DSN', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      initializeSentry();

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
          environment: 'production',
          tracesSampleRate: 0.1,
        })
      );
      expect(consoleSpy).toHaveBeenCalledWith('Sentry initialized successfully');

      consoleSpy.mockRestore();
    });

    it('should use higher sample rates in development', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });

      initializeSentry();

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 1.0,
        })
      );
    });

    it('should filter sensitive data in beforeSend', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });

      initializeSentry();

      const beforeSend = (Sentry.init as jest.Mock).mock.calls[0][0].beforeSend;

      const event: Sentry.Event = {
        request: {
          headers: {
            authorization: 'Bearer token123',
            cookie: 'session=abc123',
            'x-api-key': 'secret-key',
          },
          query_string: 'token=secret&name=test',
          data: {
            password: 'secret123',
            username: 'testuser',
          },
        },
        breadcrumbs: [
          {
            data: {
              apiKey: 'secret',
              user: 'test',
            },
          },
        ],
        extra: {
          creditCard: '1234567890',
          info: 'public',
        },
      };

      const filteredEvent = beforeSend(event, {});

      expect(filteredEvent.request?.headers?.authorization).toBeUndefined();
      expect(filteredEvent.request?.headers?.cookie).toBeUndefined();
      expect(filteredEvent.request?.query_string).toContain('FILTERED');
      expect(filteredEvent.request?.data?.password).toBe('[FILTERED]');
      expect(filteredEvent.request?.data?.username).toBe('testuser');
      expect(filteredEvent.breadcrumbs?.[0].data?.apiKey).toBe('[FILTERED]');
      expect(filteredEvent.extra?.creditCard).toBe('[FILTERED]');
      expect(filteredEvent.extra?.info).toBe('public');
    });

    it('should not send events in test environment', () => {
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });

      initializeSentry();

      const beforeSend = (Sentry.init as jest.Mock).mock.calls[0][0].beforeSend;
      const event: Sentry.Event = { message: 'test' };

      const result = beforeSend(event, {});

      expect(result).toBeNull();
    });
  });

  describe('captureException', () => {
    it('should capture exception', () => {
      const error = new Error('Test error');
      const eventId = captureException(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error);
      expect(Sentry.lastEventId).toHaveBeenCalled();
      expect(eventId).toBe('mock-event-id');
    });

    it('should capture string as exception', () => {
      captureException('String error');

      expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
      const capturedError = (Sentry.captureException as jest.Mock).mock.calls[0][0];
      expect(capturedError.message).toBe('String error');
    });

    it('should capture exception with context', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };

      captureException(error, context);

      expect(Sentry.withScope).toHaveBeenCalled();
    });
  });

  describe('captureMessage', () => {
    it('should capture message with default level', () => {
      const messageId = captureMessage('Test message');

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Test message', 'info');
      expect(Sentry.lastEventId).toHaveBeenCalled();
      expect(messageId).toBe('mock-event-id');
    });

    it('should capture message with custom level', () => {
      captureMessage('Warning message', 'warning');

      expect(Sentry.captureMessage).toHaveBeenCalledWith('Warning message', 'warning');
    });

    it('should capture message with context', () => {
      const context = { action: 'user_login' };

      captureMessage('User logged in', 'info', context);

      expect(Sentry.withScope).toHaveBeenCalled();
    });
  });

  describe('setUser', () => {
    it('should set user context', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
      };

      setUser(user);

      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });

    it('should clear user context with null', () => {
      setUser(null);

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('setContext', () => {
    it('should set custom context', () => {
      setContext('organization', { id: 'org123', name: 'Test Org' });

      expect(Sentry.setContext).toHaveBeenCalledWith('organization', {
        id: 'org123',
        name: 'Test Org',
      });
    });
  });

  describe('addBreadcrumb', () => {
    it('should add breadcrumb', () => {
      const breadcrumb = {
        message: 'User clicked button',
        category: 'ui',
        level: 'info' as Sentry.SeverityLevel,
      };

      addBreadcrumb(breadcrumb);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(breadcrumb);
    });
  });

  describe('startTransaction', () => {
    it('should start span with default op', () => {
      const transaction = startTransaction('GET /api/users');

      expect(Sentry.startSpan).toHaveBeenCalledWith(
        { name: 'GET /api/users', op: 'http.server' },
        expect.any(Function)
      );
      expect(transaction).toBeDefined();
    });

    it('should start span with custom op', () => {
      startTransaction('processPayment', 'payment');

      expect(Sentry.startSpan).toHaveBeenCalledWith(
        { name: 'processPayment', op: 'payment' },
        expect.any(Function)
      );
    });
  });
});
