'use client';

import { useState } from 'react';
import { StoryForm } from '@/components/StoryForm';
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
  storeType: string;
  launchDate: string;
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
    storeType: '',
    launchDate: '',
  });

  return (
    <main className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="w-full">
            <StoryForm story={story} setStory={setStory} />
          </div>
          <div className="w-full">
            <LeaderBoard currentConsultant={story.launchConsultant} />
          </div>
        </div>
      </div>
    </main>
  );
}
