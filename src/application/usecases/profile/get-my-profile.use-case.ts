import { User } from '@domain/entities/user/user.entity';
import { Result, ResultType } from '@domain/shared/result';
import { UserNotFoundError } from '@domain/errors/auth.errors';
import { UserRepository } from '@application/repositories/user.repository';

export type GetMyProfileOutput = {
  user: User;
};

export class GetMyProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<ResultType<GetMyProfileOutput, UserNotFoundError>> {
    const user = await this.userRepository.findById(userId);
    if (!user) return Result.Failed(new UserNotFoundError());
    return Result.Success({ user });
  }
}
