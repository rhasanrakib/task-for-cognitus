import { IptvUserModel, IIptvUserDocument } from '../models/iptv-user.model';
import { IptvUser } from '../types';

export class IptvUserService {
  public async createUsers(users: IptvUser[]): Promise<{ successful: IIptvUserDocument[]; failed: any[] }> {
    const successful: IIptvUserDocument[] = [];
    const failed: any[] = [];
    
    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await this.findExistingUser(userData);
        if (existingUser) {
          failed.push({
            userData,
            error: 'User already exists',
            existingField: this.getExistingField(existingUser, userData)
          });
          continue;
        }
        
        const user = new IptvUserModel(userData);
        const savedUser = await user.save();
        successful.push(savedUser);
      } catch (error: any) {
        failed.push({
          userData,
          error: error.message || 'Unknown error'
        });
      }
    }
    
    return {
      successful: successful,
      failed
    };
  }
  
  private async findExistingUser(userData: IptvUser): Promise<IIptvUserDocument | null> {
    // Check for existing user by unique fields
    const existingUser = await IptvUserModel.findOne({
      $or: [
        { user_name: userData.user_name },
        { email: userData.email },
        { mac: userData.mac },
        { account_number: userData.account_number }
      ]
    });
    
    return existingUser;
  }
  
  private getExistingField(existingUser: IIptvUserDocument, newUser: IptvUser): string {
    if (existingUser.user_name === newUser.user_name) return 'user_name';
    if (existingUser.email === newUser.email) return 'email';
    if (existingUser.mac === newUser.mac) return 'mac';
    if (existingUser.account_number === newUser.account_number) return 'account_number';
    return 'unknown';
  }
  
  public async getAllUsers(): Promise<IIptvUserDocument[]> {
    return await IptvUserModel.find().sort({ createdAt: -1 });
  }
  
  public async getUserById(id: string): Promise<IIptvUserDocument | null> {
    return await IptvUserModel.findById(id);
  }
  
  public async getUserByUserName(userName: string): Promise<IIptvUserDocument | null> {
    return await IptvUserModel.findOne({ user_name: userName });
  }
  
  public async deleteUser(id: string): Promise<boolean> {
    const result = await IptvUserModel.findByIdAndDelete(id);
    return !!result;
  }
  
  public async getUsersCount(): Promise<number> {
    return await IptvUserModel.countDocuments();
  }
}
