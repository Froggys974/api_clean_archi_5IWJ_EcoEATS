import { RegisterClient } from "@application/usecases/auth/register-client.use-case";
import { RegisterCourier } from "@application/usecases/auth/register-courier.use-case";
import { RegisterRestaurantOwner } from "@application/usecases/auth/register-restaurant-owner.use-case";
import { Login } from "@application/usecases/auth/login.use-case";

import { EmailAlreadyExistsError } from "@domain/errors/auth.errors";
import {
  LoginDto,
  RegisterClientDto,
  RegisterCourierDto,
  RegisterRestaurantOwnerDto,
} from "@interface/dtos/auth.dto";
import { AuthPresenter } from "@interface/presenters/auth.presenter";
import {
  ControllerResponse,
  ErrorResponse,
} from "@interface/shared/controller-response";
import {
  LoginResponse,
  RegisterResponse,
} from "@application/usecases/auth/auth.types";

export class AuthController {
  constructor(
    private readonly registerClientUseCase: RegisterClient,
    private readonly registerCourierUseCase: RegisterCourier,
    private readonly registerRestaurantOwnerUseCase: RegisterRestaurantOwner,
    private readonly loginUseCase: Login,
  ) {}

  async registerClient(
    clientInput: RegisterClientDto,
  ): Promise<ControllerResponse<RegisterResponse | ErrorResponse>> {
    if (
      !clientInput.email ||
      !clientInput.password ||
      !clientInput.firstName ||
      !clientInput.lastName
    ) {
      return { statusCode: 400, data: { message: "Missing required fields" } };
    }
    const result = await this.registerClientUseCase.execute(clientInput);

    if (!result.success) {
      if (result.error instanceof EmailAlreadyExistsError) {
        return {
          statusCode: 409,
          data: AuthPresenter.error(result.error.message),
        };
      }
      return {
        statusCode: 400,
        data: AuthPresenter.error(result.error.message),
      };
    }

    return {
      statusCode: 201,
      data: AuthPresenter.registerSuccess(result.data),
    };
  }

  async registerCourier(
    courierInput: RegisterCourierDto,
  ): Promise<ControllerResponse<RegisterResponse | ErrorResponse>> {
    if (
      !courierInput.email ||
      !courierInput.password ||
      !courierInput.firstName ||
      !courierInput.lastName ||
      !courierInput.phone
    ) {
      return { statusCode: 400, data: { message: "Missing required fields" } };
    }
    const result = await this.registerCourierUseCase.execute(courierInput);

    if (!result.success) {
      if (result.error instanceof EmailAlreadyExistsError) {
        return {
          statusCode: 409,
          data: AuthPresenter.error(result.error.message),
        };
      }
      return {
        statusCode: 400,
        data: AuthPresenter.error(result.error.message),
      };
    }

    return {
      statusCode: 201,
      data: AuthPresenter.registerSuccess(result.data),
    };
  }

  async registerRestaurantOwner(
    input: RegisterRestaurantOwnerDto,
  ): Promise<ControllerResponse<RegisterResponse | ErrorResponse>> {
    if (!input.email || !input.password || !input.firstName || !input.lastName || !input.phone) {
      return { statusCode: 400, data: { message: "Missing required fields" } };
    }
    const result = await this.registerRestaurantOwnerUseCase.execute(input);

    if (!result.success) {
      if (result.error instanceof EmailAlreadyExistsError) {
        return { statusCode: 409, data: AuthPresenter.error(result.error.message) };
      }
      return { statusCode: 400, data: AuthPresenter.error(result.error.message) };
    }

    return { statusCode: 201, data: AuthPresenter.registerSuccess(result.data) };
  }

  async login(
    loginInput: LoginDto,
  ): Promise<ControllerResponse<LoginResponse | ErrorResponse>> {
    if (!loginInput.email || !loginInput.password) {
      return { statusCode: 400, data: { message: "Missing required fields" } };
    }
    const result = await this.loginUseCase.execute(loginInput);

    if (!result.success) {
      return {
        statusCode: 401,
        data: AuthPresenter.error(result.error.message),
      };
    }

    return { statusCode: 200, data: AuthPresenter.loginSuccess(result.data) };
  }
}
