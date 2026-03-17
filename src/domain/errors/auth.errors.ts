export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Email ${email} is already taken`);
    this.name = 'EmailAlreadyExistsError';
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super(`User not found`);
    this.name = 'UserNotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super(`Invalid email or password`);
    this.name = 'InvalidCredentialsError';
  }
}