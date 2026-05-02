import { Price } from '@domain/value-objects/price.value-object';
import { Allergen } from '@domain/value-objects/allergen.value-object';
import {
  InvalidStockQuantityError,
  InsufficientStockError,
} from '@domain/errors/restaurant.errors';

type CreateDishProps = {
  id: string;
  name: string;
  description: string;
  price: Price;
  allergens?: Allergen[];
  dailyStock: number;
  availableStock?: number;
  imageUrl?: string;
  category?: string;
  isAvailable?: boolean;
  restaurantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type UpdateDishProps = {
  name?: string;
  description?: string;
  price?: Price;
  allergens?: Allergen[];
  imageUrl?: string;
  category?: string;
  isAvailable?: boolean;
};

export class Dish {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: Price,
    public readonly allergens: Allergen[],
    public readonly dailyStock: number,
    public readonly availableStock: number,
    public readonly imageUrl: string | undefined,
    public readonly category: string | undefined,
    public readonly isAvailable: boolean,
    public readonly restaurantId: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validate();
  }

  static create(props: CreateDishProps): Dish {
    return new Dish(
      props.id,
      props.name,
      props.description,
      props.price,
      props.allergens ?? [],
      props.dailyStock,
      props.availableStock ?? props.dailyStock,
      props.imageUrl,
      props.category,
      props.isAvailable ?? true,
      props.restaurantId,
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date()
    );
  }

  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Dish id is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Dish name is required');
    }

    if (!this.description || this.description.trim().length === 0) {
      throw new Error('Dish description is required');
    }

    if (this.dailyStock < 0) {
      throw new InvalidStockQuantityError(this.dailyStock);
    }

    if (this.availableStock < 0) {
      throw new InvalidStockQuantityError(this.availableStock);
    }

    if (this.availableStock > this.dailyStock) {
      throw new Error('Available stock cannot exceed daily stock');
    }
  }

  update(props: UpdateDishProps): Dish {
    return new Dish(
      this.id,
      props.name ?? this.name,
      props.description ?? this.description,
      props.price ?? this.price,
      props.allergens ?? this.allergens,
      this.dailyStock,
      this.availableStock,
      props.imageUrl ?? this.imageUrl,
      props.category ?? this.category,
      props.isAvailable ?? this.isAvailable,
      this.restaurantId,
      this.createdAt,
      new Date()
    );
  }

  setDailyStock(stock: number): Dish {
    if (stock < 0) {
      throw new InvalidStockQuantityError(stock);
    }

    return new Dish(
      this.id,
      this.name,
      this.description,
      this.price,
      this.allergens,
      stock,
      stock,
      this.imageUrl,
      this.category,
      this.isAvailable,
      this.restaurantId,
      this.createdAt,
      new Date()
    );
  }

  decreaseStock(quantity: number): Dish {
    if (quantity <= 0) {
      throw new Error('Quantity to decrease must be positive');
    }

    if (this.availableStock < quantity) {
      throw new InsufficientStockError(this.name, quantity, this.availableStock);
    }

    return new Dish(
      this.id,
      this.name,
      this.description,
      this.price,
      this.allergens,
      this.dailyStock,
      this.availableStock - quantity,
      this.imageUrl,
      this.category,
      this.isAvailable,
      this.restaurantId,
      this.createdAt,
      new Date()
    );
  }

  increaseStock(quantity: number): Dish {
    if (quantity <= 0) {
      throw new Error('Quantity to increase must be positive');
    }

    const newAvailableStock = this.availableStock + quantity;

    if (newAvailableStock > this.dailyStock) {
      throw new Error('Cannot increase stock beyond daily stock limit');
    }

    return new Dish(
      this.id,
      this.name,
      this.description,
      this.price,
      this.allergens,
      this.dailyStock,
      newAvailableStock,
      this.imageUrl,
      this.category,
      this.isAvailable,
      this.restaurantId,
      this.createdAt,
      new Date()
    );
  }

  setAvailable(available: boolean): Dish {
    return new Dish(
      this.id,
      this.name,
      this.description,
      this.price,
      this.allergens,
      this.dailyStock,
      this.availableStock,
      this.imageUrl,
      this.category,
      available,
      this.restaurantId,
      this.createdAt,
      new Date()
    );
  }

  isOutOfStock(): boolean {
    return this.availableStock === 0;
  }

  isOrderable(): boolean {
    return this.isAvailable && !this.isOutOfStock();
  }

  hasAllergen(allergen: Allergen): boolean {
    return this.allergens.some((a) => a.equals(allergen));
  }

  canFulfillQuantity(quantity: number): boolean {
    return this.availableStock >= quantity && quantity > 0;
  }
}
