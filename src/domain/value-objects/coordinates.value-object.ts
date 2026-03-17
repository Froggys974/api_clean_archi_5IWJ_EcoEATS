import { Result, ResultType } from '@domain/shared/result';

export class InvalidCoordinatesError extends Error {
  constructor(latitude: number, longitude: number) {
    super(
      `Invalid coordinates: latitude="${latitude}", longitude="${longitude}". ` +
      `Latitude must be between -90 and 90, longitude must be between -180 and 180.`
    );
    this.name = 'InvalidCoordinatesError';
  }
}

export class Coordinates {
  private constructor(
    private readonly latitude: number,
    private readonly longitude: number
  ) {}

  static create(
    latitude: number,
    longitude: number
  ): ResultType<Coordinates, InvalidCoordinatesError> {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return Result.Failed(new InvalidCoordinatesError(latitude, longitude));
    }

    return Result.Success(new Coordinates(latitude, longitude));
  }

  getLatitude(): number {
    return this.latitude;
  }

  getLongitude(): number {
    return this.longitude;
  }

  /**
   * Calculate distance to another coordinates using Haversine formula (as the crow flies)
   * @param other - The other coordinates
   * @returns Distance in kilometers
   */
  distanceTo(other: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(other.latitude - this.latitude);
    const dLon = this.toRadians(other.longitude - this.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(this.latitude)) *
        Math.cos(this.toRadians(other.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  equals(other: Coordinates): boolean {
    return (
      this.latitude === other.latitude && this.longitude === other.longitude
    );
  }

  toString(): string {
    return `${this.latitude}, ${this.longitude}`;
  }
}
