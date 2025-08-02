import { Request, Response, NextFunction } from 'express';
import { UserService } from '../modules/user-controller/user.service';
import { JwtPayload } from '../types/user.type';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export class AuthMiddleware {
  private static instance: AuthMiddleware;
  private userService: UserService;

  private constructor() {
    this.userService = UserService.getInstance();
  }

  public static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  public authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.header('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.'
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      try {
        const decoded = this.userService.verifyToken(token);
        req.user = decoded;
        next();
      } catch (error) {
        res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
        return;
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error during authentication.'
      });
      return;
    }
  };

  public optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.header('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided, but that's okay for optional auth
        next();
        return;
      }

      const token = authHeader.substring(7);

      try {
        const decoded = this.userService.verifyToken(token);
        req.user = decoded;
      } catch (error) {
        // Invalid token, but we'll continue without user info for optional auth
        console.warn('Invalid token in optional auth:', error);
      }

      next();
    } catch (error) {
      // For optional auth, we continue even if there's an error
      console.error('Error in optional auth middleware:', error);
      next();
    }
  };
}
