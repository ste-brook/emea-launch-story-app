import OpenAI from "openai";

// Create and export the OpenAI client
const openai = new OpenAI({
  baseURL: "https://proxy.shopify.ai/v1",
  apiKey: "shopify-eyJpZCI6ImE3ZjE5MjNmOGUxZGYyOThlYTRjYTNkNWYyOGFlYmY4IiwibW9kZSI6InRlYW0iLCJ0ZWFtIjoxNjY3MiwicmVwbyI6ImxhdW5jaC1jb25zdWx0YW50cyIsInNlcnZpY2UiOiJsYXVuY2gtY29uc3VsdGFudHMiLCJlbnZpcm9ubWVudCI6InByb2R1Y3Rpb24iLCJlbWFpbCI6InN0ZXBoZW4uYnJvb2tAc2hvcGlmeS5jb20iLCJjcmVhdGVkX2F0IjoiMjAyNS0wNC0wNFQwODowMTo1Ny4zNTNaIn0=-CdVBfYJCGb2VWHFxN8IweOL3mZ34ajC5JDBG8dbndyI=",
});

export default openai; 