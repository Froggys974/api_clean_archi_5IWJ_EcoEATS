import { Result, ResultType } from '@domain/shared/result';

export class InvalidPhoneError extends Error {
  constructor(value: string, country: CountryCode) {
    super(`"${value}" is not a valid phone number for country "${country}"`);
    this.name = 'InvalidPhoneError';
  }
}

export type CountryCode = 'FR';

const PHONE_VALIDATORS: Record<CountryCode, RegExp> = {
  FR: /^(\+33|0)[1-9](\d{2}){4}$/,
};

export class Phone {

  private constructor(
    private readonly value: string,
    private readonly country: CountryCode,
  ) {}

  static create(value: string, country: CountryCode = 'FR'): ResultType<Phone, InvalidPhoneError> {
    const trimmedValue = value.trim().replace(/\s+/g, '');
    const validator = PHONE_VALIDATORS[country];

    if (!validator.test(trimmedValue)) return Result.Failed(new InvalidPhoneError(value, country));

    return Result.Success(new Phone(trimmedValue, country));
  }

  getValue(): string {
    return this.value;
  }

  getCountry(): CountryCode {
    return this.country;
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }
}
