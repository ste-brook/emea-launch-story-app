'use client';

import { useState, useEffect } from 'react';

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

interface StoryFormProps {
  story: Story;
  setStory: (story: Story) => void;
}

export function StoryForm({ story, setStory }: StoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [storyState, setStoryState] = useState<Story>({
    merchantName: '',
    submissionDate: '',
    notes: '',
    launchConsultant: '',
    team: '',
    salesforceCaseLink: '',
    lineOfBusiness: [],
    gmv: '',
    enhancedStory: '',
  });

  // Set submission date to today when component mounts
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStoryState(prev => ({ ...prev, submissionDate: today }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStoryState((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineOfBusinessChange = (business: string, checked: boolean) => {
    setStoryState((prev) => ({
      ...prev,
      lineOfBusiness: checked
        ? [...(prev.lineOfBusiness || []), business]
        : (prev.lineOfBusiness || []).filter((b) => b !== business),
    }));
  };

  const enhanceStory = async () => {
    if (!storyState.notes) {
      setError('Please enter your story notes first.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/enhance-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantName: storyState.merchantName,
          notes: storyState.notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance story');
      }

      const data = await response.json();
      setStory({ ...storyState, enhancedStory: data.enhancedStory });
    } catch (err) {
      setError('Failed to enhance story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitStory = async () => {
    if (!storyState.enhancedStory) {
      setError('Please enhance your story before submitting.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/submit-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyState),
      });

      if (!response.ok) {
        throw new Error('Failed to submit story');
      }

      // Reset form after successful submission
      setStoryState({
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
    } catch (err) {
      setError('Failed to submit story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="launchConsultant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Launch Consultant
          </label>
          <input
            type="text"
            id="launchConsultant"
            value={storyState.launchConsultant}
            onChange={(e) => setStoryState({ ...storyState, launchConsultant: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500"
            placeholder="Enter consultant name"
          />
        </div>

        <div>
          <label htmlFor="team" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Team
          </label>
          <select
            id="team"
            value={storyState.team}
            onChange={(e) => setStoryState({ ...storyState, team: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500"
          >
            <option value="">Select team</option>
            <option value="Large">Large</option>
            <option value="Mid Market">Mid Market</option>
          </select>
        </div>

        <div>
          <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Merchant Name
          </label>
          <input
            type="text"
            id="merchantName"
            value={storyState.merchantName}
            onChange={(e) => setStoryState({ ...storyState, merchantName: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500"
            placeholder="Enter merchant name"
          />
        </div>

        <div>
          <label htmlFor="salesforceCaseLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Salesforce Case Link
          </label>
          <input
            type="url"
            id="salesforceCaseLink"
            value={storyState.salesforceCaseLink}
            onChange={(e) => setStoryState({ ...storyState, salesforceCaseLink: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500"
            placeholder="Enter Salesforce case URL"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Line of Business
          </label>
          <div className="flex flex-wrap gap-4">
            {['D2C', 'B2B', 'POS Pro'].map((business) => (
              <label key={business} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={storyState.lineOfBusiness?.includes(business) || false}
                  onChange={(e) => handleLineOfBusinessChange(business, e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{business}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="gmv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            GMV
          </label>
          <input
            type="text"
            id="gmv"
            value={storyState.gmv}
            onChange={(e) => setStoryState({ ...storyState, gmv: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500"
            placeholder="Enter GMV"
          />
        </div>

        <div>
          <label htmlFor="submissionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Submission Date
          </label>
          <input
            type="date"
            id="submissionDate"
            value={storyState.submissionDate}
            onChange={(e) => setStoryState({ ...storyState, submissionDate: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500 [&::-webkit-calendar-picker-indicator]:dark:invert"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="storyNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Story Notes
          </label>
          <textarea
            id="storyNotes"
            value={storyState.notes}
            onChange={(e) => setStoryState({ ...storyState, notes: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500"
            placeholder="Enter story notes..."
          />
        </div>

        {error && (
          <div className="md:col-span-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 mt-6 md:col-span-2">
        <button
          type="button"
          onClick={enhanceStory}
          disabled={isLoading || !storyState.notes}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enhancing...
            </>
          ) : (
            'Enhance Story'
          )}
        </button>

        <button
          type="button"
          onClick={submitStory}
          disabled={isLoading || !storyState.enhancedStory}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit Story'
          )}
        </button>
      </div>
    </div>
  );
} 