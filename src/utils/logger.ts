import * as Sentry from '@sentry/node';

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private readonly isDevelopment = process.env.NODE_ENV !== 'production';

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    if (this.isDevelopment) {
      console.log(JSON.stringify(logEntry, null, 2));
    } else {
      console.log(JSON.stringify(logEntry));
    }

    // Send to Sentry for error levels
    if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
      Sentry.captureMessage(message, level === LogLevel.FATAL ? 'fatal' : 'error');
      if (context?.error) {
        Sentry.captureException(context.error);
      }
    }
  }

  trace(message: string, context?: LogContext): void {
    this.log(LogLevel.TRACE, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  fatal(message: string, context?: LogContext): void {
    this.log(LogLevel.FATAL, message, context);
  }

  // Template literal function for structured logging
  fmt(strings: TemplateStringsArray, ...values: unknown[]): string {
    return strings.reduce((result, str, i) => {
      const value = i < values.length ? values[i] : '';
      return result + str + value;
    }, '');
  }
}

export const logger = new Logger();
