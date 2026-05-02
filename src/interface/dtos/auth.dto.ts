export type RegisterClientDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export type RegisterCourierDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type RegisterRestaurantOwnerDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantCity: string;
};

export type LoginDto = {
  email: string;
  password: string;
};