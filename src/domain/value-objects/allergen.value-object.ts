import { Result, ResultType } from '@domain/shared/result';

export class InvalidAllergenError extends Error {
  constructor(value: string) {
    super(`"${value}" is not a valid allergen`);
    this.name = 'InvalidAllergenError';
  }
}

export type AllergenType =
  | 'GLUTEN'
  | 'CRUSTACEANS'
  | 'EGGS'
  | 'FISH'
  | 'PEANUTS'
  | 'SOYBEANS'
  | 'MILK'
  | 'NUTS'
  | 'CELERY'
  | 'MUSTARD'
  | 'SESAME'
  | 'SULPHITES'
  | 'LUPIN'
  | 'MOLLUSCS';

const VALID_ALLERGENS: AllergenType[] = [
  'GLUTEN',
  'CRUSTACEANS',
  'EGGS',
  'FISH',
  'PEANUTS',
  'SOYBEANS',
  'MILK',
  'NUTS',
  'CELERY',
  'MUSTARD',
  'SESAME',
  'SULPHITES',
  'LUPIN',
  'MOLLUSCS',
];

export class Allergen {
  private constructor(private readonly type: AllergenType) {}

  static create(type: string): ResultType<Allergen, InvalidAllergenError> {
    const upperType = type.toUpperCase() as AllergenType;

    if (!VALID_ALLERGENS.includes(upperType)) {
      return Result.Failed(new InvalidAllergenError(type));
    }

    return Result.Success(new Allergen(upperType));
  }

  getType(): AllergenType {
    return this.type;
  }

  equals(other: Allergen): boolean {
    return this.type === other.type;
  }

  toString(): string {
    return this.type;
  }

  static getValidAllergens(): AllergenType[] {
    return [...VALID_ALLERGENS];
  }
}
