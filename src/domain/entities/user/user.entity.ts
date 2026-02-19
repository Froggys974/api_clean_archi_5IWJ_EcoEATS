
import { Email } from "@domain/value-objects/email.value-object";

export type UserRole = 'CLIENT' | 'RESTAURATEUR' | 'COURIER' | 'ADMIN';

type CreateUserProps = {
  id: string;
  email: Email;
  passwordHash: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  createdAt?: Date;
};

type UpdateUserProps = {
  email?: Email;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
};

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly passwordHash: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly roles: UserRole[],
    public readonly createdAt: Date,
  ) {}

  static create(props: CreateUserProps): User {
    return new User(
      props.id,
      props.email,
      props.passwordHash,
      props.firstName,
      props.lastName,
      props.roles,
      props.createdAt ?? new Date(),
    );
  }

  update(props: UpdateUserProps): User {
    return new User(
      this.id,
      props.email ?? this.email,
      props.passwordHash ?? this.passwordHash,
      props.firstName ?? this.firstName,
      props.lastName ?? this.lastName,
      this.roles,
      this.createdAt,
    );
  }

  hasRole(role: UserRole): boolean {
    return this.roles.includes(role);
  }
}