# Launch Story App

A modern web application for Shopify Launch Consultants to submit and enhance their launch stories. The app uses OpenAI to enhance stories and automatically submits them to Google Sheets for review.

## Features

- Clean, modern UI with dark mode support
- Story enhancement using OpenAI's GPT-4
- Automatic submission to Google Sheets
- Form validation and error handling
- Real-time preview of enhanced stories
- Mobile-responsive design

## Prerequisites

- Node.js 18.x or later
- OpenAI API key
- Google Cloud Project with Sheets API enabled
- Google Service Account credentials

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd launch-story-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_CLIENT_EMAIL=your_google_client_email_here
   GOOGLE_PRIVATE_KEY=your_google_private_key_here
   GOOGLE_PROJECT_ID=your_google_project_id_here
   GOOGLE_SHEET_ID=your_google_sheet_id_here
   ```

4. Set up Google Sheets:
   - Create a new Google Sheet
   - Share it with the service account email
   - Copy the Sheet ID from the URL
   - Add the following headers to the first row:
     - Submission Date
     - Merchant Name
     - Enhanced Story
     - Timestamp

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter the merchant's name
2. Select the submission date
3. Write your story notes
4. Click "Enhance Story" to use OpenAI to improve your story
5. Review the enhanced story
6. Click "Submit Story" to send it to Google Sheets

## API Integration

### OpenAI
The app uses OpenAI's GPT-4 model to enhance launch stories. The prompt is designed to maintain professionalism while making the story engaging and highlighting key achievements.

### Google Sheets
Stories are automatically submitted to a Google Sheet with the following columns:
- Submission Date
- Merchant Name
- Enhanced Story
- Timestamp

## Development

- Built with Next.js 14
- TypeScript for type safety
- Tailwind CSS for styling
- OpenAI API for story enhancement
- Google Sheets API for submission

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
