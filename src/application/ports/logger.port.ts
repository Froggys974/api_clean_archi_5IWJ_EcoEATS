export interface LoggerPort {
  log(message: string, context?: string): void;
  error(message: string, error?: unknown, context?: string): void;
  warn(message: string, context?: string): void;
}
