import OpenAI from 'openai';

// Constants
const API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.OPENAI_BASE_URL;

// Validate environment variables
const validateEnvVars = () => {
  if (!API_KEY) throw new Error('OPENAI_API_KEY is not defined');
  if (!BASE_URL) throw new Error('OPENAI_BASE_URL is not defined');
};

// Initialize OpenAI client
const initializeOpenAI = () => {
  validateEnvVars();
  
  return new OpenAI({
    apiKey: API_KEY,
    baseURL: BASE_URL,
  });
};

// Singleton instance
let openAIClient: OpenAI | null = null;

// Get OpenAI client instance
const getOpenAIClient = () => {
  if (!openAIClient) {
    openAIClient = initializeOpenAI();
  }
  return openAIClient;
};

// Generate story summary
export async function generateStorySummary(story: string): Promise<string> {
  const client = getOpenAIClient();
  
  try {
    console.log('Generating story summary');
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes launch stories in a concise and engaging way.',
        },
        {
          role: 'user',
          content: `Please summarize this launch story in 2-3 sentences: ${story}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
    
    const summary = response.choices[0]?.message?.content || 'Unable to generate summary';
    console.log('Story summary generated:', summary);
    return summary;
  } catch (error) {
    console.error('Error generating story summary:', error);
    throw error;
  }
}

// Generate story title
export async function generateStoryTitle(story: string): Promise<string> {
  const client = getOpenAIClient();
  
  try {
    console.log('Generating story title');
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that creates engaging titles for launch stories.',
        },
        {
          role: 'user',
          content: `Please create a catchy title for this launch story: ${story}`,
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });
    
    const title = response.choices[0]?.message?.content || 'Untitled Story';
    console.log('Story title generated:', title);
    return title;
  } catch (error) {
    console.error('Error generating story title:', error);
    throw error;
  }
} 