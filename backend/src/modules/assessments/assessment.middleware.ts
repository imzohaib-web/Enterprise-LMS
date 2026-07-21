import { Request, Response, NextFunction } from 'express';
import { UserRole } from './assessment.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        email?: string;
      };
    }
  }
}

/**
 * Placeholder role authorization middleware.
 * Reads user role from req.user, header ('x-user-role'), or defaults to placeholder.
 * Allows access if role matches one of allowedRoles (e.g. 'instructor', 'admin').
 * Returns HTTP 403 Forbidden if unauthorized.
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const currentRole = (req.user?.role || (req.headers['x-user-role'] as UserRole) || 'student') as UserRole;

    if (!allowedRoles.includes(currentRole)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Your role is '${currentRole}'.`,
      });
      return;
    }

    next();
  };
};
