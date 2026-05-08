import { User } from '@domain/entities/user/user.entity';

export type ProfileResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  createdAt: string;
};

export class ProfilePresenter {
  static toResponse(user: User): ProfileResponse {
    return {
      id: user.id,
      email: user.email.getValue(),
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
