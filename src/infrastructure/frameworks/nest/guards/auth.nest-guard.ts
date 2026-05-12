import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@interface/guards/auth.guard';
import { UserRole } from '@domain/entities/user/user.entity';

function createNestGuard(role?: UserRole) {
  @Injectable()
  class RoleNestGuard implements CanActivate {
    constructor(public readonly authGuard: AuthGuard) {}

    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest<{ headers: { authorization?: string }; userId?: string; userRoles?: string[] }>();
      const token = req.headers.authorization?.split(' ')[1];
      const result = this.authGuard.verify(token, role);
      if (!result.success) return false;
      req.userId = result.data.id;
      req.userRoles = result.data.roles;
      return true;
    }
  }
  return RoleNestGuard;
}

export const ClientNestGuard = createNestGuard('CLIENT');
export const CourierNestGuard = createNestGuard('COURIER');
export const OwnerNestGuard = createNestGuard('RESTAURATEUR');
export const AuthenticatedNestGuard = createNestGuard();
