import { HttpException } from '@nestjs/common';
import { ControllerResponse } from '@interface/shared/controller-response';

export function resolveResponse<T>(response: ControllerResponse<T>): T {
  if (response.statusCode >= 400) {
    throw new HttpException(response.data as Record<string, unknown>, response.statusCode);
  }
  return response.data as T;
}
