interface SlackMessage {
  merchantName: string;
  launchConsultant: string;
  lineOfBusiness: string[];
  gmv: {
    D2C?: string;
    B2B?: string;
    'POS Pro'?: string;
  };
  launchStatus: string;
  salesforceCaseLink: string;
  docUrl?: string | null;
}

export async function sendSlackNotification(story: SlackMessage) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('Slack webhook URL not configured');
    return;
  }

  // Calculate total GMV
  const totalGmv = Object.values(story.gmv)
    .filter(value => value)
    .reduce((sum, value) => sum + parseFloat(value.replace(/[^0-9.]/g, '')), 0);

  // Format GMV details
  const gmvDetails = Object.entries(story.gmv)
    .filter(([_, value]) => value)
    .map(([type, value]) => `• ${type}: ${value}`)
    .join('\n');

  const message = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🚀 New Launch Story Submitted! 🎉",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Merchant:*\n${story.merchantName}`
          },
          {
            type: "mrkdwn",
            text: `*Launch Consultant:*\n${story.launchConsultant}`
          }
        ]
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Launch Status:*\n${story.launchStatus}`
          },
          {
            type: "mrkdwn",
            text: `*Business Lines:*\n${story.lineOfBusiness.join(', ')}`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*GMV Details:*\n${gmvDetails}\n*Total GMV: $${totalGmv.toLocaleString()}*`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Links:*\n• <${story.salesforceCaseLink}|Salesforce Case>${story.docUrl ? `\n• <${story.docUrl}|View Full Story in Google Docs>` : ''}`
        }
      },
      {
        type: "divider"
      }
    ]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Failed to send Slack notification: ${response.statusText}`);
    }

    console.log('Slack notification sent successfully');
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
} 