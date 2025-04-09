import { google } from 'googleapis';

// Constants
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
const PROJECT_ID = process.env.GOOGLE_SHEETS_PROJECT_ID;

// Validate environment variables
const validateEnvVars = () => {
  const missingVars = [];
  
  if (!SPREADSHEET_ID) missingVars.push('GOOGLE_SHEETS_ID');
  if (!CLIENT_EMAIL) missingVars.push('GOOGLE_SHEETS_CLIENT_EMAIL');
  if (!PRIVATE_KEY) missingVars.push('GOOGLE_SHEETS_PRIVATE_KEY');
  if (!PROJECT_ID) missingVars.push('GOOGLE_SHEETS_PROJECT_ID');
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Export the auth client for reuse in other Google APIs
export async function getGoogleAuthClient() {
  validateEnvVars();
  
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY,
      project_id: PROJECT_ID,
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/documents'
    ],
  });
}

// Initialize Google Sheets API
const initializeSheetsAPI = () => {
  validateEnvVars();
  
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
        project_id: PROJECT_ID,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error initializing Google Sheets API:', error);
    throw new Error('Failed to initialize Google Sheets API');
  }
};

// Singleton instance
let sheetsAPI: ReturnType<typeof google.sheets> | null = null;

// Get sheets API instance
const getSheetsAPI = () => {
  if (!sheetsAPI) {
    sheetsAPI = initializeSheetsAPI();
  }
  return sheetsAPI;
};

// Get sheet name
export async function getSheetName() {
  validateEnvVars();
  const sheets = getSheetsAPI();
  
  try {
    console.log('Getting sheet name with spreadsheetId:', SPREADSHEET_ID);
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    const sheetsList = response.data.sheets || [];
    if (sheetsList.length === 0) {
      throw new Error('No sheets found in the spreadsheet');
    }
    
    console.log('Available sheets:', sheetsList.map(sheet => sheet.properties?.title));
    return sheetsList[0].properties?.title || 'Sheet1';
  } catch (error) {
    console.error('Error getting sheet name:', error);
    throw error;
  }
}

// Ensure headers exist
export async function ensureHeadersExist(sheetName: string) {
  const sheets = getSheetsAPI();
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:Z1`,
    });
    
    const headers = response.data.values?.[0] || [];
    if (headers.length === 0) {
      throw new Error('No headers found in the sheet');
    }
    
    console.log('Headers found:', headers);
    return headers;
  } catch (error) {
    console.error('Error ensuring headers exist:', error);
    throw error;
  }
}

// Append data to sheet
export async function appendData(sheetName: string, data: any[]) {
  const sheets = getSheetsAPI();
  
  try {
    console.log('Appending data to Google Sheet:', data);
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: data,
      },
    });
    
    console.log('Data appended successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error appending data:', error);
    throw error;
  }
}

// Get all data from sheet
export async function getAllData(sheetName: string) {
  const sheets = getSheetsAPI();
  
  try {
    console.log('Using sheet:', sheetName);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
    });
    
    const headers = await ensureHeadersExist(sheetName);
    console.log('Headers found:', headers);
    
    const values = response.data.values || [];
    return values.slice(1); // Skip header row
  } catch (error) {
    console.error('Error getting all data:', error);
    throw error;
  }
}

// Get leaderboard data
export function getLeaderboardData(data: any[]) {
  const submissionsByConsultant = new Map<string, number>();
  
  data.forEach(row => {
    const consultant = row[0]?.replace(/\s+/g, ' ').trim(); // Remove all extra whitespace and trim
    if (consultant) {
      submissionsByConsultant.set(
        consultant,
        (submissionsByConsultant.get(consultant) || 0) + 1
      );
    }
  });
  
  const leaderboard = Array.from(submissionsByConsultant.entries())
    .map(([name, submissions], index) => ({
      name,
      submissions,
      rank: index + 1,
    }))
    .sort((a, b) => b.submissions - a.submissions);
  
  console.log('Leaderboard data:', leaderboard);
  return leaderboard;
}

// Format line of business data
export function formatLineOfBusinessData(story: any): any[][] {
  // For each business type, if it's selected use its GMV value, if not use 'n/a'
  const d2cGmv = story.lineOfBusiness?.includes('D2C') ? story.gmv.D2C : 'n/a';
  const b2bGmv = story.lineOfBusiness?.includes('B2B') ? story.gmv.B2B : 'n/a';
  const posProGmv = story.lineOfBusiness?.includes('POS Pro') ? story.gmv['POS Pro'] : 'n/a';
  
  // Format date as DD-MM-YYYY
  const date = new Date();
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
  
  return [
    [
      story.launchConsultant?.replace(/\s+/g, ' ').trim() || '', // Remove all extra whitespace and trim
      story.merchantName,
      story.salesforceCaseLink,
      story.opportunityRevenue,
      story.launchStatus,
      d2cGmv,
      b2bGmv,
      posProGmv,
      story.enhancedStory || '',
      formattedDate
    ],
  ];
} 