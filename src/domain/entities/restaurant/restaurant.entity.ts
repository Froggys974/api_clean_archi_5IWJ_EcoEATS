import { Address } from '@domain/value-objects/address.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { Dish } from './dish.entity';

export type RestaurantStatus = 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED';

export type OpeningHours = {
  dayOfWeek: number; // 0 = Sunday
  openTime: string; // Format: "HH:MM"
  closeTime: string; // Format: "HH:MM"
};

type CreateRestaurantProps = {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: Address;
  phone: Phone;
  cuisineType: string;
  openingHours?: OpeningHours[];
  status?: RestaurantStatus;
  imageUrl?: string;
  rating?: number;
  highlighted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type UpdateRestaurantProps = {
  name?: string;
  description?: string;
  address?: Address;
  phone?: Phone;
  cuisineType?: string;
  openingHours?: OpeningHours[];
  imageUrl?: string;
  rating?: number;
};

export class Restaurant {
  private constructor(
    public readonly id: string,
    public readonly ownerId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly address: Address,
    public readonly phone: Phone,
    public readonly cuisineType: string,
    public readonly openingHours: OpeningHours[],
    public readonly status: RestaurantStatus,
    public readonly imageUrl: string | undefined,
    public readonly rating: number,
    public readonly highlighted: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  static create(props: CreateRestaurantProps): Restaurant {
    return new Restaurant(
      props.id,
      props.ownerId,
      props.name,
      props.description,
      props.address,
      props.phone,
      props.cuisineType,
      props.openingHours ?? [],
      props.status ?? 'CLOSED',
      props.imageUrl,
      props.rating ?? 0,
      props.highlighted ?? false,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date()
    );
  }

  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Restaurant id is required');
    }

    if (!this.ownerId || this.ownerId.trim().length === 0) {
      throw new Error('Restaurant owner id is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Restaurant name is required');
    }

    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Restaurant description is required');
    }

    if (!this.cuisineType || this.cuisineType.trim().length === 0) {
      throw new Error('Restaurant cuisine type is required');
    }

    if (this.rating < 0 || this.rating > 5) {
      throw new Error('Restaurant rating must be between 0 and 5');
    }

    this.validateOpeningHours();
  }

  private validateOpeningHours(): void {
    for (const hours of this.openingHours) {
      if (hours.dayOfWeek < 0 || hours.dayOfWeek > 6) {
        throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
      }

      if (!this.isValidTimeFormat(hours.openTime)) {
        throw new Error(`Invalid open time format: ${hours.openTime}. Expected HH:MM`);
      }

      if (!this.isValidTimeFormat(hours.closeTime)) {
        throw new Error(`Invalid close time format: ${hours.closeTime}. Expected HH:MM`);
      }
    }
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  update(props: UpdateRestaurantProps): Restaurant {
    return new Restaurant(
      this.id,
      this.ownerId,
      props.name ?? this.name,
      props.description ?? this.description,
      props.address ?? this.address,
      props.phone ?? this.phone,
      props.cuisineType ?? this.cuisineType,
      props.openingHours ?? this.openingHours,
      this.status,
      props.imageUrl ?? this.imageUrl,
      props.rating ?? this.rating,
      this.highlighted,
      this.createdAt,
      new Date()
    );
  }

  setStatus(status: RestaurantStatus): Restaurant {
    return new Restaurant(
      this.id, this.ownerId, this.name, this.description,
      this.address, this.phone, this.cuisineType, this.openingHours,
      status, this.imageUrl, this.rating, this.highlighted,
      this.createdAt, new Date()
    );
  }

  open(): Restaurant {
    return this.setStatus('OPEN');
  }

  close(): Restaurant {
    return this.setStatus('CLOSED');
  }

  temporarilyClose(): Restaurant {
    return this.setStatus('TEMPORARILY_CLOSED');
  }

  isOpen(): boolean {
    return this.status === 'OPEN';
  }

  isClosed(): boolean {
    return this.status === 'CLOSED' || this.status === 'TEMPORARILY_CLOSED';
  }

  isOpenAt(date: Date = new Date()): boolean {
    if (!this.isOpen()) {
      return false;
    }

    const dayOfWeek = date.getDay();
    const currentTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

    const todayHours = this.openingHours.find((h) => h.dayOfWeek === dayOfWeek);

    if (!todayHours) {
      return false;
    }

    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
  }

  setOpeningHours(openingHours: OpeningHours[]): Restaurant {
    return new Restaurant(
      this.id,
      this.ownerId,
      this.name,
      this.description,
      this.address,
      this.phone,
      this.cuisineType,
      openingHours,
      this.status,
      this.imageUrl,
      this.rating,
      this.highlighted,
      this.createdAt,
      new Date()
    );
  }

  updateRating(newRating: number): Restaurant {
    if (newRating < 0 || newRating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }

    return new Restaurant(
      this.id,
      this.ownerId,
      this.name,
      this.description,
      this.address,
      this.phone,
      this.cuisineType,
      this.openingHours,
      this.status,
      this.imageUrl,
      newRating,
      this.highlighted,
      this.createdAt,
      new Date()
    );
  }

  belongsToOwner(ownerId: string): boolean {
    return this.ownerId === ownerId;
  }
}
