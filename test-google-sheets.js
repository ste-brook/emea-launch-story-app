// Test script to verify Google Sheets API connection
require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');
const { 
  getSheetName, 
  ensureHeadersExist, 
  appendData 
} = require('./src/lib/googleSheets');

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function testGoogleSheetsConnection() {
  try {
    console.log('Testing Google Sheets API connection...');
    console.log('Using credentials:', {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      project_id: process.env.GOOGLE_SHEETS_PROJECT_ID,
      sheet_id: process.env.GOOGLE_SHEETS_ID,
      private_key_length: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.length || 0
    });

    // Get the sheet name
    const sheetName = await getSheetName();
    console.log(`Using sheet: ${sheetName}`);

    // Ensure headers exist
    await ensureHeadersExist(sheetName);

    // Try to read some data
    const testRow = [
      'Test Consultant', // Column A: Launch Consultant
      'Test Merchant', // Column B: Merchant Name
      'https://salesforce.com/test', // Column C: Salesforce Case Link
      '10000', // Column D: Opportunity Revenue
      'Launch', // Column E: Launch Status
      'Yes = 5000', // Column F: D2C GMV
      'n/a', // Column G: B2B GMV
      'n/a', // Column H: POS Pro GMV
      'This is a test enhanced story', // Column I: Enhanced Story
      new Date().toISOString().split('T')[0], // Column J: Submission Date
    ];

    // Append test data
    await appendData(sheetName, [testRow]);
    console.log('Test data appended successfully');

    console.log('Google Sheets API connection test completed successfully!');
  } catch (error) {
    console.error('Error testing Google Sheets API connection:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

testGoogleSheetsConnection(); 