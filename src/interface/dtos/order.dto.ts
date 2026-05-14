export type CheckoutDto = {
  cartId: string;
  deliveryStreet: string;
  deliveryCity: string;
  deliveryPostalCode: string;
  deliveryCountry: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  tipAmount?: number;
};

export type AcceptOrderDto = {
  preparationTimeMinutes: number;
};

export type RefuseOrderDto = {
  reason?: string;
};
