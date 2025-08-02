import { Router } from 'express';
import { UserController } from '../modules/user-controller/user.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

export class UserRoutes {
  public router: Router;
  private userController: UserController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.userController = UserController.getInstance();
    this.authMiddleware = AuthMiddleware.getInstance();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public routes
    this.router.post('/auth/register', this.userController.register.bind(this.userController));
    this.router.post('/auth/login', this.userController.login.bind(this.userController));
    
    // Protected routes
    this.router.get('/auth/profile', 
      this.authMiddleware.authenticate, 
      this.userController.getProfile.bind(this.userController)
    );
  }
}
