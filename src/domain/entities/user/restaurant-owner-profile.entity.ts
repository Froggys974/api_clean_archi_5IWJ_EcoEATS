import { Phone } from '@domain/value-objects/phone.value-object';
import { ProfileStatus } from './profile-status';
import { User } from './user.entity';

type CreateRestaurantOwnerProfileProps = {
  id: string;
  user: User;
  phone: Phone;
  accountStatus?: ProfileStatus;
  createdAt?: Date;
};

type UpdateRestaurantOwnerProfileProps = {
  phone?: Phone;
  accountStatus?: ProfileStatus;
};

export class RestaurantOwnerProfile {
  private constructor(
    public readonly id: string,
    public readonly user: User,
    public readonly phone: Phone,
    public readonly accountStatus: ProfileStatus,
    public readonly createdAt: Date,
  ) {}

  static create(props: CreateRestaurantOwnerProfileProps): RestaurantOwnerProfile {
    return new RestaurantOwnerProfile(
      props.id,
      props.user,
      props.phone,
      props.accountStatus ?? 'PENDING',
      props.createdAt ?? new Date(),
    );
  }

  update(props: UpdateRestaurantOwnerProfileProps): RestaurantOwnerProfile {
    return new RestaurantOwnerProfile(
      this.id,
      this.user,
      props.phone ?? this.phone,
      props.accountStatus ?? this.accountStatus,
      this.createdAt,
    );
  }
}
