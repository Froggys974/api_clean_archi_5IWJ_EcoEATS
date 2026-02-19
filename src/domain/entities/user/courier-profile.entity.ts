import { Phone } from '@domain/value-objects/phone.value-object';
import { CourierStatus, ProfileStatus } from './profile-status';
import { User } from './user.entity';


type CreateCourierProfileProps = {
  id: string;
  user: User;
  phone: Phone;
  status?: CourierStatus;
  accountStatus?: ProfileStatus;
  createdAt?: Date;
};

type UpdateCourierProfileProps = {
  phone?: Phone;
  status?: CourierStatus;
  accountStatus?: ProfileStatus;
};

export class CourierProfile {
  private constructor(
    public readonly id: string,
    public readonly user: User,
    public readonly phone: Phone,
    public readonly status: CourierStatus,
    public readonly accountStatus: ProfileStatus,
    public readonly createdAt: Date,
  ) {}

  static create(props: CreateCourierProfileProps): CourierProfile {
    return new CourierProfile(
      props.id,
      props.user,
      props.phone,
      props.status ?? 'UNAVAILABLE',
      props.accountStatus ?? 'PENDING',
      props.createdAt ?? new Date(),
    );
  }

  update(props: UpdateCourierProfileProps): CourierProfile {
    return new CourierProfile(
      this.id,
      this.user,
      props.phone ?? this.phone,
      props.status ?? this.status,
      props.accountStatus ?? this.accountStatus,
      this.createdAt,
    );
  }

  setAvailable(): CourierProfile {
    return this.update({ status: 'AVAILABLE' });
  }

  setUnavailable(): CourierProfile {
    return this.update({ status: 'UNAVAILABLE' });
  }
}
