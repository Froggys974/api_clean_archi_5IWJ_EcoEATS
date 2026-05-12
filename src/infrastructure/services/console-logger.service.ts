import { LoggerPort } from '@application/ports/logger.port';

export class ConsoleLoggerService implements LoggerPort {
  log(message: string, context?: string): void {
    console.log(context ? `[${context}] ${message}` : message);
  }

  error(message: string, error?: unknown, context?: string): void {
    console.error(context ? `[${context}] ${message}` : message, error ?? '');
  }

  warn(message: string, context?: string): void {
    console.warn(context ? `[${context}] ${message}` : message);
  }
}
