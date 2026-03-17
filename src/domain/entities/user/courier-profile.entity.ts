import { Phone } from '@domain/value-objects/phone.value-object';
import { CourierStatus, ProfileStatus, CourierLevel } from './profile-status';
import { User } from './user.entity';


type CreateCourierProfileProps = {
  id: string;
  user: User;
  phone: Phone;
  status?: CourierStatus;
  accountStatus?: ProfileStatus;
  level?: CourierLevel;
  activeDeliveriesCount?: number;
  createdAt?: Date;
};

type UpdateCourierProfileProps = {
  phone?: Phone;
  status?: CourierStatus;
  accountStatus?: ProfileStatus;
  level?: CourierLevel;
  activeDeliveriesCount?: number;
};

export class CourierProfile {
  private constructor(
    public readonly id: string,
    public readonly user: User,
    public readonly phone: Phone,
    public readonly status: CourierStatus,
    public readonly accountStatus: ProfileStatus,
    public readonly level: CourierLevel,
    public readonly activeDeliveriesCount: number,
    public readonly createdAt: Date,
  ) {}

  static create(props: CreateCourierProfileProps): CourierProfile {
    return new CourierProfile(
      props.id,
      props.user,
      props.phone,
      props.status ?? 'UNAVAILABLE',
      props.accountStatus ?? 'PENDING',
      props.level ?? "STANDARD",
      props.activeDeliveriesCount ?? 0,
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
      props.level ?? this.level,
      props.activeDeliveriesCount ?? this.activeDeliveriesCount,
      this.createdAt,
    );
  }

  setAvailable(): CourierProfile {
    return this.update({ status: 'AVAILABLE' });
  }

  setUnavailable(): CourierProfile {
    return this.update({ status: 'UNAVAILABLE' });
  }

  setLevel(level: CourierLevel): CourierProfile {
    return this.update({ level });
  }

  promoteToExpert(): CourierProfile {
    return this.update({ level: "EXPERT" });
  }

  demoteToStandard(): CourierProfile {
    return this.update({ level: "STANDARD" });
  }

  isExpert(): boolean {
    return this.level === "EXPERT";
  }

  isStandard(): boolean {
    return this.level === "STANDARD";
  }

  incrementActiveDeliveries(): CourierProfile {
    return this.update({
      activeDeliveriesCount: this.activeDeliveriesCount + 1,
    });
  }

  decrementActiveDeliveries(): CourierProfile {
    const newCount = Math.max(0, this.activeDeliveriesCount - 1);
    return this.update({ activeDeliveriesCount: newCount });
  }

  canAcceptDelivery(): boolean {
    if (this.status !== "AVAILABLE") {
      return false;
    }

    if (this.isStandard()) {
      return this.activeDeliveriesCount === 0;
    }

    // Expert couriers can have up to 2 deliveries
    return this.activeDeliveriesCount < 2;
  }

  hasActiveDeliveries(): boolean {
    return this.activeDeliveriesCount > 0;
  }

  getMaxDeliveries(): number {
    return this.isExpert() ? 2 : 1;
  }
}
