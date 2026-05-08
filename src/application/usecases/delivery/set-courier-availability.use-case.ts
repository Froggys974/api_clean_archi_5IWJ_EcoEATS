import { Result, ResultType } from '@domain/shared/result';
import { CourierProfile } from '@domain/entities/user/courier-profile.entity';
import { CourierProfileRepository } from '@application/repositories/courier-profile.repository';

export type SetCourierAvailabilityInput = {
  courierId: string;
  available: boolean;
};

export type SetCourierAvailabilityOutput = {
  profile: CourierProfile;
};

export class SetCourierAvailabilityUseCase {
  constructor(private readonly courierProfileRepository: CourierProfileRepository) {}

  async execute(input: SetCourierAvailabilityInput): Promise<ResultType<SetCourierAvailabilityOutput, Error>> {
    try {
      const profile = await this.courierProfileRepository.findByUserId(input.courierId);
      if (!profile) {
        return Result.Failed(new Error(`Courier profile not found for user ${input.courierId}`));
      }

      const updatedProfile = input.available ? profile.setAvailable() : profile.setUnavailable();
      await this.courierProfileRepository.update(updatedProfile);
      return Result.Success({ profile: updatedProfile });
    } catch (error) {
      return Result.Failed(
        new Error(`Failed to update courier availability: ${(error as Error).message}`),
      );
    }
  }
}