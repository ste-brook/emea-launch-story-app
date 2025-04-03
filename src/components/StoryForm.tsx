'use client';

import { useState } from 'react';

interface Story {
  merchantName: string;
  submissionDate: string;
  notes: string;
  enhancedStory: string;
}

interface StoryFormProps {
  story: Story;
  setStory: (story: Story) => void;
}

export function StoryForm({ story, setStory }: StoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStory({ ...story, [name]: value });
  };

  const enhanceStory = async () => {
    if (!story.notes) {
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
          merchantName: story.merchantName,
          notes: story.notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance story');
      }

      const data = await response.json();
      setStory({ ...story, enhancedStory: data.enhancedStory });
    } catch (err) {
      setError('Failed to enhance story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitStory = async () => {
    if (!story.enhancedStory) {
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
        body: JSON.stringify(story),
      });

      if (!response.ok) {
        throw new Error('Failed to submit story');
      }

      // Reset form after successful submission
      setStory({
        merchantName: '',
        submissionDate: new Date().toISOString().split('T')[0],
        notes: '',
        enhancedStory: '',
      });
    } catch (err) {
      setError('Failed to submit story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Merchant Name
        </label>
        <input
          type="text"
          name="merchantName"
          id="merchantName"
          value={story.merchantName}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter merchant name"
        />
      </div>

      <div>
        <label htmlFor="submissionDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Submission Date
        </label>
        <input
          type="date"
          name="submissionDate"
          id="submissionDate"
          value={story.submissionDate}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Your Story Notes
        </label>
        <textarea
          name="notes"
          id="notes"
          rows={4}
          value={story.notes}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter your story notes here..."
        />
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={enhanceStory}
          disabled={isLoading || !story.notes}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Enhancing...' : 'Enhance Story'}
        </button>

        <button
          type="button"
          onClick={submitStory}
          disabled={isLoading || !story.enhancedStory}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Submitting...' : 'Submit Story'}
        </button>
      </div>
    </div>
  );
} 