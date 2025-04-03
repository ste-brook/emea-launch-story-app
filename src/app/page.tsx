'use client';

import { useState } from 'react';
import { StoryForm } from '@/components/StoryForm';
import { StoryPreview } from '@/components/StoryPreview';

export default function Home() {
  const [story, setStory] = useState({
    merchantName: '',
    submissionDate: new Date().toISOString().split('T')[0],
    notes: '',
    enhancedStory: '',
  });

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Submit Your Launch Story
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
            <p>Share your success story about helping merchants launch on Shopify.</p>
          </div>
          <div className="mt-5">
            <StoryForm story={story} setStory={setStory} />
          </div>
        </div>
      </div>

      {story.enhancedStory && (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
              Enhanced Story Preview
            </h3>
            <div className="mt-5">
              <StoryPreview story={story.enhancedStory} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
