export type AddDishDto = {
  name: string;
  description: string;
  priceAmount: number;
  allergens?: string[];
  dailyStock: number;
  imageUrl?: string;
  category?: string;
};

export type UpdateDishDto = {
  name?: string;
  description?: string;
  priceAmount?: number;
  allergens?: string[];
  dailyStock?: number;
  imageUrl?: string;
  category?: string;
  isAvailable?: boolean;
};

export type UpdateRestaurantDto = {
  name?: string;
  description?: string;
  cuisineType?: string;
  imageUrl?: string;
  openingHours?: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
  }>;
  status?: 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED';
};

export type AddOfferDto = {
  label: string;
  discountPercent: number;
  imageUrl?: string;
};
