'use client';

import { useState } from 'react';
import { StoryForm, type Story } from '@/components/StoryForm';
import { LeaderBoard } from '@/components/LeaderBoard';

export default function Home() {
  const [story, setStory] = useState<Story>({
    merchantName: '',
    notes: '',
    enhancedStory: '',
    launchConsultant: '',
    team: '',
    salesforceCaseLink: '',
    lineOfBusiness: [],
    gmv: {},
    launchStatus: '',
    launchDate: '',
    opportunityRevenue: '',
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full">
        <StoryForm story={story} setStory={setStory} />
      </div>
      <div className="w-full">
        <LeaderBoard currentConsultant={story.launchConsultant} />
      </div>
      <div className="text-center text-[var(--p-color-text-subdued)] text-sm mt-2">
        Feedback? <a href="https://shopify.enterprise.slack.com/team/U03AY7YAKBQ" target="_blank" rel="noopener noreferrer" className="text-[var(--p-color-text-primary)] hover:underline">@Stephen</a>
      </div>
    </div>
  );
}
