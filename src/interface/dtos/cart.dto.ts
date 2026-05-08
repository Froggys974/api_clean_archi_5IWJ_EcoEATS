export type AddItemDto = {
  dishId: string;
  restaurantId: string;
  quantity: number;
  specialInstructions?: string;
};
