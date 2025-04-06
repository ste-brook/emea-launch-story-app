import { NextResponse } from 'next/server';
import { getSheetName, getAllData, getLeaderboardData } from '@/api/integrations/googleSheets';

// Remove force-dynamic export as it conflicts with static export
export const revalidate = 0;

export async function GET() {
  try {
    console.log('Fetching leaderboard data');
    
    // Get the sheet name
    const sheetName = await getSheetName();
    console.log('Using sheet:', sheetName);
    
    // Get all data from the sheet
    const data = await getAllData(sheetName);
    
    // Process the data to get leaderboard information
    const leaderboardData = getLeaderboardData(data);
    console.log('Leaderboard data:', leaderboardData);

    return NextResponse.json({ contributors: leaderboardData });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
} 