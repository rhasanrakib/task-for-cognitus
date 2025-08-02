import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel, UserDocument } from '../../models/user.model';
import { ConfigService } from '../../config/config.service';
import { 
  UserCreateRequest, 
  UserLoginRequest, 
  AuthResponse, 
  UserResponse, 
  JwtPayload 
} from '../../types/user.type';

export class UserService {
  private static instance: UserService;
  private config: ConfigService;

  private constructor() {
    this.config = ConfigService.getInstance();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public async register(userData: UserCreateRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = new UserModel(userData);
      await user.save();

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        token,
        user: this.formatUserResponse(user)
      };
    } catch (error) {
      throw error;
    }
  }

  public async login(credentials: UserLoginRequest): Promise<AuthResponse> {
    try {
      // Find user and include password for comparison
      const user = await UserModel.findOne({ email: credentials.email }).select('+password');
      
      if (!user || !(await user.comparePassword(credentials.password))) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        token,
        user: this.formatUserResponse(user)
      };
    } catch (error) {
      throw error;
    }
  }

  public async getUserById(userId: string): Promise<UserResponse | null> {
    try {
      const user = await UserModel.findById(userId);
      return user ? this.formatUserResponse(user) : null;
    } catch (error) {
      throw error;
    }
  }

  public verifyToken(token: string): JwtPayload {
    try {
      const authConfig = this.config.getAuthConfig();
      const decoded = jwt.verify(token, authConfig.jwtSecret) as JwtPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  private generateToken(user: UserDocument): string {
    const authConfig = this.config.getAuthConfig();
    const payload: JwtPayload = {
      userId: (user._id as any).toString(),
      email: user.email
    };

    return jwt.sign(payload, authConfig.jwtSecret, { expiresIn: '7d' });
  }

  private formatUserResponse(user: UserDocument): UserResponse {
    return {
      _id: (user._id as any).toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
