import { google } from 'googleapis';

// Constants
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
const PROJECT_ID = process.env.GOOGLE_SHEETS_PROJECT_ID;

// Validate environment variables
const validateEnvVars = () => {
  if (!SPREADSHEET_ID) throw new Error('GOOGLE_SHEETS_ID is not defined');
  if (!CLIENT_EMAIL) throw new Error('GOOGLE_SHEETS_CLIENT_EMAIL is not defined');
  if (!PRIVATE_KEY) throw new Error('GOOGLE_SHEETS_PRIVATE_KEY is not defined');
  if (!PROJECT_ID) throw new Error('GOOGLE_SHEETS_PROJECT_ID is not defined');
};

// Initialize Google Sheets API
const initializeSheetsAPI = () => {
  validateEnvVars();
  
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  return google.sheets({ version: 'v4', auth });
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
  const sheets = getSheetsAPI();
  
  try {
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
    console.log('Appending data to Google Sheet');
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [data],
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
    const consultant = row[0]; // First column is Launch Consultant
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
  return [
    [
      story.launchConsultant,
      story.merchantName,
      story.salesforceCaseLink,
      story.opportunityRevenue,
      story.launchStatus,
      story.d2cGmv,
      story.b2bGmv,
      story.retailGmv,
      story.story,
      story.submissionDate,
      story.title || '',
      story.summary || ''
    ],
  ];
} 