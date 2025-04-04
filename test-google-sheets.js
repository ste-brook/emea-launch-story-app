// Test script to verify Google Sheets API connection
const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    project_id: process.env.GOOGLE_PROJECT_ID,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function testGoogleSheetsConnection() {
  try {
    console.log('Testing Google Sheets API connection...');
    console.log('Using credentials:', {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      project_id: process.env.GOOGLE_PROJECT_ID,
      sheet_id: process.env.GOOGLE_SHEET_ID,
      private_key_length: process.env.GOOGLE_PRIVATE_KEY?.length || 0
    });

    // Try to get the spreadsheet metadata
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    console.log('Successfully connected to Google Sheets!');
    console.log('Spreadsheet title:', response.data.properties.title);
    console.log('Spreadsheet URL:', response.data.spreadsheetUrl);

    // Get sheet names
    const sheetsList = response.data.sheets.map(sheet => sheet.properties.title);
    console.log('Available sheets:', sheetsList);

    // Use the first sheet if 'Stories' doesn't exist
    const sheetName = sheetsList.includes('Stories') ? 'Stories' : sheetsList[0];
    console.log('Using sheet:', sheetName);

    // Try to read some data
    const valuesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheetName}!A1:I1`,
    });

    console.log('Headers in the sheet:', valuesResponse.data.values?.[0] || 'No headers found');

    // Try to append a test row
    const testRow = [
      new Date().toISOString().split('T')[0],
      'Test Merchant',
      'Test Consultant',
      'Test Segment',
      '1000',
      'D2C',
      'This is a test submission',
      'This is a test enhanced story',
      new Date().toISOString(),
    ];

    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${sheetName}!A:I`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [testRow],
      },
    });

    console.log('Successfully appended test row to the sheet!');
    console.log('Append response:', appendResponse.data);

  } catch (error) {
    console.error('Error testing Google Sheets API:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

testGoogleSheetsConnection(); 