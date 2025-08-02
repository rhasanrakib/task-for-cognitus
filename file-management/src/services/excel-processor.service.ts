import * as XLSX from 'xlsx';
import { IptvUser } from '../types';

export class ExcelProcessorService {
  public processExcelFile(filePath: string): IptvUser[] {
    try {
      // Read the Excel file
      const workbook = XLSX.readFile(filePath);
      
      // Get the first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Skip the header row and process data
      const dataRows = jsonData.slice(1) as string[][];
      
      const users: IptvUser[] = [];
      
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        
        // Skip empty rows
        if (!row || row.length === 0 || !row[0]) {
          continue;
        }
        
        // Validate required fields
        if (row.length < 6) {
          console.warn(`Row ${i + 2} has insufficient columns, skipping...`);
          continue;
        }
        
        const user: IptvUser = {
          name: this.cleanString(row[0]),
          user_name: this.cleanString(row[1]),
          email: this.cleanString(row[2]).toLowerCase(),
          ip: this.cleanString(row[3]),
          mac: this.cleanString(row[4]).toUpperCase(),
          account_number: this.cleanString(row[5]),
        };
        
        // Validate data
        if (this.validateUser(user)) {
          users.push(user);
        } else {
          console.warn(`Row ${i + 2} has invalid data, skipping...`, user);
        }
      }
      
      return users;
    } catch (error) {
      console.error('Error processing Excel file:', error);
      throw error;
    }
  }
  
  private cleanString(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).trim();
  }
  
  private validateUser(user: IptvUser): boolean {
    // Check if all required fields are present and valid
    if (!user.name || !user.user_name || !user.email || !user.ip || !user.mac || !user.account_number) {
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      return false;
    }
    
    // Basic IP validation
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(user.ip)) {
      return false;
    }
    
    // Basic MAC address validation
    const macRegex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i;
    if (!macRegex.test(user.mac)) {
      return false;
    }
    
    return true;
  }
}
