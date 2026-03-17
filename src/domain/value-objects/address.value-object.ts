import { Result, ResultType } from '@domain/shared/result';
import { Coordinates } from './coordinates.value-object';

export class InvalidAddressError extends Error {
  constructor(message: string) {
    super(`Invalid address: ${message}`);
    this.name = 'InvalidAddressError';
  }
}

type AddressProps = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  additionalInfo?: string;
  coordinates: Coordinates;
};

export class Address {
  private constructor(
    private readonly street: string,
    private readonly city: string,
    private readonly postalCode: string,
    private readonly country: string,
    private readonly additionalInfo: string | undefined,
    private readonly coordinates: Coordinates
  ) {}

  static create(props: AddressProps): ResultType<Address, InvalidAddressError> {
    const trimmedStreet = props.street.trim();
    const trimmedCity = props.city.trim();
    const trimmedPostalCode = props.postalCode.trim();
    const trimmedCountry = props.country.trim();

    if (!trimmedStreet || trimmedStreet.length === 0) {
      return Result.Failed(new InvalidAddressError('Street is required'));
    }

    if (!trimmedCity || trimmedCity.length === 0) {
      return Result.Failed(new InvalidAddressError('City is required'));
    }

    if (!trimmedPostalCode || trimmedPostalCode.length === 0) {
      return Result.Failed(new InvalidAddressError('Postal code is required'));
    }

    if (!trimmedCountry || trimmedCountry.length === 0) {
      return Result.Failed(new InvalidAddressError('Country is required'));
    }

    return Result.Success(
      new Address(
        trimmedStreet,
        trimmedCity,
        trimmedPostalCode,
        trimmedCountry,
        props.additionalInfo?.trim(),
        props.coordinates
      )
    );
  }

  getStreet(): string {
    return this.street;
  }

  getCity(): string {
    return this.city;
  }

  getPostalCode(): string {
    return this.postalCode;
  }

  getCountry(): string {
    return this.country;
  }

  getAdditionalInfo(): string | undefined {
    return this.additionalInfo;
  }

  getCoordinates(): Coordinates {
    return this.coordinates;
  }

  /**
   * Calculate distance to another address (as the crow flies)
   * @param other - The other address
   * @returns Distance in kilometers
   */
  distanceTo(other: Address): number {
    return this.coordinates.distanceTo(other.coordinates);
  }

  getFullAddress(): string {
    const parts = [this.street, this.city, this.postalCode, this.country];
    if (this.additionalInfo) {
      parts.splice(1, 0, this.additionalInfo);
    }
    return parts.join(', ');
  }

  equals(other: Address): boolean {
    return (
      this.street === other.street &&
      this.city === other.city &&
      this.postalCode === other.postalCode &&
      this.country === other.country &&
      this.additionalInfo === other.additionalInfo &&
      this.coordinates.equals(other.coordinates)
    );
  }

  toString(): string {
    return this.getFullAddress();
  }
}
