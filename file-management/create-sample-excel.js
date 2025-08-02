const XLSX = require('xlsx');
const path = require('path');

// Sample IPTV users data
const sampleData = [
  ['Name', 'Username', 'Email', 'IP', 'MAC', 'Account Number'],
  ['John Doe', 'johndoe', 'john.doe@example.com', '192.168.1.10', 'AA:BB:CC:DD:EE:FF', 'ACC001'],
  ['Jane Smith', 'janesmith', 'jane.smith@example.com', '192.168.1.11', 'BB:CC:DD:EE:FF:AA', 'ACC002'],
  ['Bob Johnson', 'bobjohnson', 'bob.johnson@example.com', '192.168.1.12', 'CC:DD:EE:FF:AA:BB', 'ACC003'],
  ['Alice Brown', 'alicebrown', 'alice.brown@example.com', '192.168.1.13', 'DD:EE:FF:AA:BB:CC', 'ACC004'],
  ['Charlie Wilson', 'charliewilson', 'charlie.wilson@example.com', '192.168.1.14', 'EE:FF:AA:BB:CC:DD', 'ACC005']
];

// Create a new workbook
const wb = XLSX.utils.book_new();

// Create a worksheet from the data
const ws = XLSX.utils.aoa_to_sheet(sampleData);

// Set column widths
ws['!cols'] = [
  { wch: 20 }, // Name
  { wch: 15 }, // Username
  { wch: 25 }, // Email
  { wch: 15 }, // IP
  { wch: 18 }, // MAC
  { wch: 15 }  // Account Number
];

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(wb, ws, 'IPTV Users');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Write the file
const filePath = path.join(uploadsDir, 'sample-iptv-users.xlsx');
XLSX.writeFile(wb, filePath);

console.log(`✅ Sample Excel file created: ${filePath}`);
console.log('📊 File contains:');
console.log(`   - ${sampleData.length - 1} user records`);
console.log('   - Headers: Name, Username, Email, IP, MAC, Account Number');
console.log('');
console.log('🔧 You can use this file to test the file processing service.');
console.log('📝 The file contains sample IPTV user data with proper validation formats.');

// Display the sample data
console.log('\n📋 Sample data preview:');
sampleData.forEach((row, index) => {
  if (index === 0) {
    console.log('Headers:', row.join(' | '));
    console.log('-'.repeat(80));
  } else {
    console.log(`User ${index}:`, row.join(' | '));
  }
});
