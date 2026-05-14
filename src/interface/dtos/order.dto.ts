export type CheckoutDto = {
  cartId: string;
  deliveryStreet: string;
  deliveryCity: string;
  deliveryPostalCode: string;
  deliveryCountry: string;
  tipAmount?: number;
};

export type AcceptOrderDto = {
  preparationTimeMinutes: number;
};

export type RefuseOrderDto = {
  reason?: string;
};
