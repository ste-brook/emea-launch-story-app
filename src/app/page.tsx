'use client';

import { useState } from 'react';
import { StoryForm } from '@/components/StoryForm';
import { LeaderBoard } from '@/components/LeaderBoard';
import type { Story } from '@/components/StoryForm';

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
    gmv: {},
    storeType: '',
    launchDate: '',
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="w-full">
        <StoryForm story={story} setStory={setStory} />
      </div>
      <div className="w-full">
        <LeaderBoard currentConsultant={story.launchConsultant} />
      </div>
    </div>
  );
}
