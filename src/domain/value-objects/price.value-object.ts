import { Result, ResultType } from '@domain/shared/result';

export class InvalidPriceError extends Error {
  constructor(value: number) {
    super(`"${value}" is not a valid price. Price must be non-negative.`);
    this.name = 'InvalidPriceError';
  }
}

export class Price {
  private constructor(
    private readonly amount: number,
    private readonly currency: string = 'EUR'
  ) {}

  static create(
    amount: number,
    currency: string = 'EUR'
  ): ResultType<Price, InvalidPriceError> {
    if (amount < 0) {
      return Result.Failed(new InvalidPriceError(amount));
    }

    // Round to 2 decimal places
    const roundedAmount = Math.round(amount * 100) / 100;

    return Result.Success(new Price(roundedAmount, currency));
  }

  static zero(currency: string = 'EUR'): Price {
    return new Price(0, currency);
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Price): ResultType<Price, Error> {
    if (this.currency !== other.currency) {
      return Result.Failed(
        new Error(
          `Cannot add prices with different currencies: ${this.currency} and ${other.currency}`
        )
      );
    }

    return Price.create(this.amount + other.amount, this.currency);
  }

  subtract(other: Price): ResultType<Price, Error> {
    if (this.currency !== other.currency) {
      return Result.Failed(
        new Error(
          `Cannot subtract prices with different currencies: ${this.currency} and ${other.currency}`
        )
      );
    }

    return Price.create(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): ResultType<Price, InvalidPriceError> {
    return Price.create(this.amount * factor, this.currency);
  }

  equals(other: Price): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  greaterThan(other: Price): boolean {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot compare prices with different currencies: ${this.currency} and ${other.currency}`
      );
    }
    return this.amount > other.amount;
  }

  lessThan(other: Price): boolean {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot compare prices with different currencies: ${this.currency} and ${other.currency}`
      );
    }
    return this.amount < other.amount;
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }
}
