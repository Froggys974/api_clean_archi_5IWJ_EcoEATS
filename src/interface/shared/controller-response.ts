export type ErrorResponse = {
  message: string;
};

export type ControllerResponse<T> = {
  statusCode: number;
  data: T;
};