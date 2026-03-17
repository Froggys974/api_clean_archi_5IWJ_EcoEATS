import { Result, ResultType } from '@domain/shared/result';

export class InvalidDistanceError extends Error {
  constructor(value: number) {
    super(`"${value}" is not a valid distance. Distance must be non-negative.`);
    this.name = 'InvalidDistanceError';
  }
}

export class Distance {
  private constructor(
    private readonly kilometers: number
  ) {}

  static create(kilometers: number): ResultType<Distance, InvalidDistanceError> {
    if (kilometers < 0) {
      return Result.Failed(new InvalidDistanceError(kilometers));
    }

    // Round to 2 decimal places
    const roundedKilometers = Math.round(kilometers * 100) / 100;

    return Result.Success(new Distance(roundedKilometers));
  }

  static zero(): Distance {
    return new Distance(0);
  }

  getKilometers(): number {
    return this.kilometers;
  }

  getMeters(): number {
    return this.kilometers * 1000;
  }

  add(other: Distance): ResultType<Distance, InvalidDistanceError> {
    return Distance.create(this.kilometers + other.kilometers);
  }

  subtract(other: Distance): ResultType<Distance, InvalidDistanceError> {
    return Distance.create(this.kilometers - other.kilometers);
  }

  multiply(factor: number): ResultType<Distance, InvalidDistanceError> {
    return Distance.create(this.kilometers * factor);
  }

  equals(other: Distance): boolean {
    return this.kilometers === other.kilometers;
  }

  greaterThan(other: Distance): boolean {
    return this.kilometers > other.kilometers;
  }

  lessThan(other: Distance): boolean {
    return this.kilometers < other.kilometers;
  }

  greaterThanOrEqual(other: Distance): boolean {
    return this.kilometers >= other.kilometers;
  }

  lessThanOrEqual(other: Distance): boolean {
    return this.kilometers <= other.kilometers;
  }

  toString(): string {
    return `${this.kilometers} km`;
  }

  toJSON(): { kilometers: number; meters: number } {
    return {
      kilometers: this.kilometers,
      meters: this.getMeters(),
    };
  }
}
