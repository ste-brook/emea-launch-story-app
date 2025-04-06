import { NextResponse } from 'next/server';
import { getSheetName, getAllData, getLeaderboardData } from '@/lib/googleSheets';

// Configure the API route to be dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('Fetching leaderboard data');
    
    // Get the sheet name
    const sheetName = await getSheetName();
    
    // Get all data from the sheet
    const data = await getAllData(sheetName);
    
    // Process the data to get leaderboard information
    const leaderboardData = getLeaderboardData(data);

    return NextResponse.json({ contributors: leaderboardData });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
} 