import { LoginResponse, RegisterResponse } from "@application/usecases/auth/auth.types";

export class AuthPresenter {
  static registerSuccess(data: RegisterResponse) {
    return {
      userId: data.userId,
      message: 'Registration successful',
    };
  }

  static loginSuccess(data: LoginResponse) {
    return {
      token: data.token,
    };
  }

  static error(message: string) {
    return {
      message,
    };
  }
}