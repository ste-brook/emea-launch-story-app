/**
 * AI Rules Configuration
 * 
 * This file contains the rules and guidelines for the AI when enhancing stories.
 * Update these rules as needed to adjust the AI's behavior.
 */

import { AI_PROMPT } from './ai-prompt';

export const AI_RULES = {
  // Word limit for enhanced stories
  wordLimit: 200,
  
  // Import system message and prompt template from AI_PROMPT
  systemMessage: AI_PROMPT.systemMessage,
  promptTemplate: AI_PROMPT.template,
  
  // Model configuration
  modelConfig: {
    model: "gpt-3.5-turbo",
    temperature: 0.4,
    max_tokens: 400,
    presence_penalty: 0.1,
    frequency_penalty: 0.1,
    response_format: { type: "text" as const }
  }
}; 