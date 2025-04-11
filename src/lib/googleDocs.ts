import { google } from 'googleapis';
import { getGoogleAuthClient } from './googleSheets';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

// Validate environment variables
const validateEnvVars = () => {
  const missingVars = [];
  
  if (!FOLDER_ID) missingVars.push('GOOGLE_DRIVE_FOLDER_ID');
  if (!CLIENT_EMAIL) missingVars.push('GOOGLE_SHEETS_CLIENT_EMAIL');
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

export interface LaunchStoryDoc {
  merchantName: string;
  launchConsultant: string;
  salesforceCaseLink: string;
  opportunityRevenue: string;
  launchStatus: string;
  lineOfBusiness: string[];
  gmv: {
    D2C?: string;
    B2B?: string;
    'POS Pro'?: string;
  };
  notes: string;
  story: string;
  team?: string;
  enhancedStory?: string;
}

export async function createLaunchStoryDoc(storyData: LaunchStoryDoc): Promise<string> {
  try {
    validateEnvVars();
    const auth = await getGoogleAuthClient();
    const docs = google.docs({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Format the current date and document title
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const documentTitle = `${formattedDate} - ${storyData.launchConsultant} - ${storyData.merchantName}`;

    // Create a new Google Doc in the root first
    const createResponse = await drive.files.create({
      requestBody: {
        name: documentTitle,
        mimeType: 'application/vnd.google-apps.document'
      },
      fields: 'id',
      supportsAllDrives: true
    });

    console.log('Create response:', createResponse.data);
    
    const docId = createResponse.data?.id;
    if (!docId) throw new Error('Failed to create Google Doc');

    console.log('Created document with ID:', docId);

    // Now try to move it to the folder
    try {
      const moveResponse = await drive.files.update({
        fileId: docId,
        addParents: FOLDER_ID as string,
        removeParents: 'root',
        fields: 'id, parents',
        supportsAllDrives: true,
        supportsTeamDrives: true
      });
      
      console.log('Move response:', moveResponse.data);
    } catch (moveError: any) {
      console.error('Error moving document:', {
        docId,
        folderId: FOLDER_ID,
        error: moveError.message,
        response: moveError.response?.data
      });
      // Continue even if move fails - we'll still have the document
    }

    // Format the document content based on the sheet structure
    const content = [
      `${storyData.merchantName} - Launch Story`,
      '',
      'Launch Consultant',
      `${storyData.launchConsultant}`,
      '',
      'Merchant Name',
      `${storyData.merchantName}`,
      '',
      'Salesforce Case Link',
      `${storyData.salesforceCaseLink}`,
      '',
      'Opportunity Revenue',
      `${storyData.opportunityRevenue ? `$${storyData.opportunityRevenue} USD` : 'N/A'}`,
      '',
      'Launch Status',
      `${storyData.launchStatus}`,
      '',
      'D2C GMV',
      `${storyData.gmv?.D2C ? `$${storyData.gmv.D2C} USD` : 'N/A'}`,
      '',
      'B2B GMV',
      `${storyData.gmv?.B2B ? `$${storyData.gmv.B2B} USD` : 'N/A'}`,
      '',
      'Retail GMV',
      `${storyData.gmv?.['POS Pro'] ? `$${storyData.gmv['POS Pro']} USD` : 'N/A'}`,
      '',
      'Story',
      `${storyData.enhancedStory || storyData.story || 'N/A'}`,
      '',
      'Submission Date',
      `${formattedDate}`
    ].join('\n');

    // Update the document content with bold formatting
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: content
            }
          },
          // Apply bold formatting to the title
          {
            updateTextStyle: {
              range: {
                startIndex: 1,
                endIndex: storyData.merchantName.length + " - Launch Story".length + 1
              },
              textStyle: {
                bold: true,
                fontSize: { magnitude: 14, unit: 'PT' }
              },
              fields: 'bold,fontSize'
            }
          },
          // Apply bold formatting to all headings
          ...['Launch Consultant', 'Merchant Name', 'Salesforce Case Link', 
              'Opportunity Revenue', 'Launch Status', 'D2C GMV', 'B2B GMV', 
              'Retail GMV', 'Story', 'Submission Date'].map(heading => {
            // Find the exact position of each heading in the content
            const headingIndex = content.indexOf(`\n${heading}\n`);
            const startIndex = headingIndex !== -1 ? headingIndex + 2 : content.indexOf(heading) + 1; // +2 to account for newline
            return {
              updateTextStyle: {
                range: {
                  startIndex: startIndex,
                  endIndex: startIndex + heading.length
                },
                textStyle: {
                  bold: true
                },
                fields: 'bold'
              }
            };
          })
        ]
      }
    });

    return `https://docs.google.com/document/d/${docId}/edit`;
  } catch (error) {
    console.error('Error creating Google Doc:', error);
    throw error;
  }
}

function formatDocumentContent(data: LaunchStoryDoc): string {
  const gmvDetails = Object.entries(data.gmv)
    .filter(([_, value]) => value)
    .map(([type, value]) => `${type}: ${value}`)
    .join('\n');

  return `Launch Story Details
===================

Merchant Information
-------------------
Merchant Name: ${data.merchantName}
Launch Consultant: ${data.launchConsultant}
Team: ${data.team || 'N/A'}
Launch Status: ${data.launchStatus}
Salesforce Case: ${data.salesforceCaseLink}
Opportunity Revenue: ${data.opportunityRevenue}

Business Lines
-------------
${data.lineOfBusiness.join(', ')}

GMV Details
----------
${gmvDetails}

Launch Story
-----------
${data.story}

Additional Notes
--------------
${data.notes}

Document generated on ${new Date().toLocaleString()}
`;
} 