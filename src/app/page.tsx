'use client';

import { useState } from 'react';
import { StoryForm } from '@/components/StoryForm';
import { StoryPreview } from '@/components/StoryPreview';

interface Story {
  merchantName: string;
  submissionDate: string;
  notes: string;
  enhancedStory: string;
  launchConsultant: string;
  team: string;
  salesforceCaseLink: string;
  lineOfBusiness: string[];
  gmv: string;
}

export default function Home() {
  const [story, setStory] = useState<Story>({
    merchantName: '',
    submissionDate: new Date().toISOString().split('T')[0],
    notes: '',
    enhancedStory: '',
    launchConsultant: '',
    team: '',
    salesforceCaseLink: '',
    lineOfBusiness: [],
    gmv: '',
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl rounded-xl p-6 border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-[1.01]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-t-xl"></div>
          <div className="mt-4">
            <StoryForm story={story} setStory={setStory} />
          </div>
        </div>
      </div>
    </div>
  );
}
