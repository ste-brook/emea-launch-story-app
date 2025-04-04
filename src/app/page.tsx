'use client';

import { useState } from 'react';
import { StoryForm } from '@/components/StoryForm';
import { StoryPreview } from '@/components/StoryPreview';
import { LeaderBoard } from '@/components/LeaderBoard';

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
    <main className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4">
            <LeaderBoard currentConsultant={story.launchConsultant} />
          </div>
          <div className="lg:col-span-8">
            <StoryForm story={story} setStory={setStory} />
          </div>
        </div>
      </div>
    </main>
  );
}
