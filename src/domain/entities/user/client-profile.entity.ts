import { Phone } from '@domain/value-objects/phone.value-object';
import { User } from './user.entity';

type CreateClientProfileProps = {
  id: string;
  user: User;
  phone: Phone | null;
  createdAt?: Date;
};

type UpdateClientProfileProps = {
  phone: Phone | null;
};

export class ClientProfile {
  private constructor(
    public readonly id: string,
    public readonly user: User,
    public readonly phone: Phone | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: CreateClientProfileProps): ClientProfile {
    return new ClientProfile(
      props.id,
      props.user,
      props.phone,
      props.createdAt ?? new Date(),
    );
  }

  update(props: UpdateClientProfileProps): ClientProfile {
    return new ClientProfile(
      this.id,
      this.user,
      props.phone ?? this.phone,
      this.createdAt,
    );
  }
}
