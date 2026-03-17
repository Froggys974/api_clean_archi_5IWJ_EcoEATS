import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@domain/entities/user/user.entity';
import { AuthGuard } from '@interface/guards/auth.guard';


export function authMiddleware(authGuard: AuthGuard, requiredRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    const result = authGuard.verify(token, requiredRole);

    if (!result.success) {
      return res.status(401).json({ message: result.error.message });
    }

    next();
  };
}