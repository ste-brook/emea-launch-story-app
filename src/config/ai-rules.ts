/**
 * AI Rules Configuration
 * 
 * This file contains the rules and guidelines for the AI when enhancing stories.
 * Update these rules as needed to adjust the AI's behavior.
 */

export const AI_RULES = {
  // Word limit for enhanced stories
  wordLimit: 130,
  
  // System message for the AI
  systemMessage: `You are an expert Shopify Launch Consultant who crafts success stories about merchant launches.
Your role is to transform launch notes into consistently structured, professional stories.
You must STRICTLY follow the provided format and rules without deviation.
Never exceed the ${130} word limit.
Never make up or embellish facts - use ONLY the provided information.
If information for any section is missing, write "No information provided" for that section.`,
  
  // Prompt template for the AI
  promptTemplate: (merchantName: string, notes: string) => `Transform these launch notes into a structured success story following this EXACT format:

MERCHANT: ${merchantName}
ORIGINAL NOTES: ${notes}

Your response must follow this EXACT structure with these EXACT headings:

CHALLENGE:
[1-2 sentences describing the main challenge or goal the merchant faced]

SOLUTION:
[1-2 sentences explaining what specific Shopify solutions or features were implemented]

OUTCOME:
[1-2 sentences highlighting quantifiable results, improvements, or positive impact]

STRICT FORMATTING RULES:
1. Use EXACTLY the headings shown above: CHALLENGE, SOLUTION, OUTCOME
2. Each section must be 1-2 sentences only
3. Total word count must not exceed ${130} words
4. Use clear, professional language - no marketing fluff
5. Include specific details and numbers when available
6. Start each section with an action verb when possible
7. Write in third person perspective
8. Use past tense consistently

TONE REQUIREMENTS:
- Professional and direct
- Factual and specific
- No superlatives or exaggeration
- No casual or conversational language
- No adjectives unless describing measurable qualities

If any section lacks information, write "No information provided" for that section.

Format your response exactly as shown above, with clear headings and sections.`,
  
  // Model configuration
  modelConfig: {
    model: "gpt-4-turbo-preview",
    temperature: 0.3, // Reduced for more consistent output
    max_tokens: 1000,
  }
}; 