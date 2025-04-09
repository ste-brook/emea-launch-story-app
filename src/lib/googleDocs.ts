import { google } from 'googleapis';
import { getGoogleAuthClient } from './googleSheets';

const FOLDER_ID = '1VcCUB0NCINhYXtbMhDSmexP2IrMNtyOa';

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
  enhancedStory: string;
  team?: string;
}

export async function createLaunchStoryDoc(storyData: LaunchStoryDoc): Promise<string> {
  try {
    const auth = await getGoogleAuthClient();
    const docs = google.docs({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Create a new Google Doc
    const createResponse = await docs.documents.create({
      requestBody: {
        title: `Launch Story - ${storyData.merchantName} - ${new Date().toLocaleDateString()}`
      }
    });

    const docId = createResponse.data.documentId;
    if (!docId) throw new Error('Failed to create Google Doc');

    // Move the doc to the specified folder
    await drive.files.update({
      fileId: docId,
      addParents: FOLDER_ID,
      fields: 'id, parents'
    });

    // Format the document content
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: formatDocumentContent(storyData)
            }
          }
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
${data.enhancedStory}

Additional Notes
--------------
${data.notes}

Document generated on ${new Date().toLocaleString()}
`;
} 