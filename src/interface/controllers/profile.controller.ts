import { GetMyProfileUseCase } from '@application/usecases/profile/get-my-profile.use-case';
import { UserNotFoundError } from '@domain/errors/auth.errors';
import { ProfilePresenter, ProfileResponse } from '@interface/presenters/profile.presenter';
import { ControllerResponse, ErrorResponse } from '@interface/shared/controller-response';

export class ProfileController {
  constructor(private readonly getMyProfileUseCase: GetMyProfileUseCase) {}

  async handleGetMe(userId: string): Promise<ControllerResponse<ProfileResponse | ErrorResponse>> {
    const result = await this.getMyProfileUseCase.execute(userId);

    if (!result.success) {
      if (result.error instanceof UserNotFoundError) {
        return { statusCode: 404, data: { message: result.error.message } };
      }
      return { statusCode: 500, data: { message: 'Internal server error' } };
    }

    return { statusCode: 200, data: ProfilePresenter.toResponse(result.data.user) };
  }
}
