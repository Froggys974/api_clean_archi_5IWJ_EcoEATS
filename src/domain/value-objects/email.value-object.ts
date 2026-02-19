import { Result, ResultType } from '@domain/shared/result';

export class InvalidEmailError extends Error {
  constructor(value: string) {
    super(`"${value}" is not a valid email`);
    this.name = 'InvalidEmailError';
  }
}

export class Email {

  private constructor(private readonly value: string) {}

  static create(value: string): ResultType<Email, InvalidEmailError> {
    const trimmedValue = value.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);

    if (!isValidEmail) return Result.Failed(new InvalidEmailError(value));

    return Result.Success(new Email(trimmedValue));
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}