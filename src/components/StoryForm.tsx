'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from './Sparkles';
import { Celebration } from './Celebration';

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

interface StoryFormProps {
  story: Story;
  setStory: (story: Story) => void;
}

export function StoryForm({ story, setStory }: StoryFormProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isEnhancedStoryVisible, setIsEnhancedStoryVisible] = useState(false);
  const [isEnhancedStoryEditable, setIsEnhancedStoryEditable] = useState(false);
  const [isEnhancedStoryTransitioning, setIsEnhancedStoryTransitioning] = useState(false);

  const handleLineOfBusinessChange = (business: string, checked: boolean) => {
    setStory({
      ...story,
      lineOfBusiness: checked
        ? [...(story.lineOfBusiness || []), business]
        : (story.lineOfBusiness || []).filter((b: string) => b !== business),
    });
  };

  const handleMerchantSegmentChange = (segment: string) => {
    setStory({
      ...story,
      storeType: segment,
    });
  };

  const validateFields = () => {
    const errors: Record<string, string> = {};
    
    if (!story.merchantName) {
      errors.merchantName = 'Merchant name is required';
    }
    
    if (!story.notes) {
      errors.notes = 'Story notes are required';
    }

    if (!story.launchConsultant) {
      errors.launchConsultant = 'Launch consultant is required';
    }

    if (!story.storeType) {
      errors.storeType = 'Merchant segment is required';
    }

    if (!story.submissionDate) {
      errors.submissionDate = 'Submission date is required';
    }

    if (!story.gmv) {
      errors.gmv = 'GMV is required';
    }

    if (!story.lineOfBusiness || story.lineOfBusiness.length === 0) {
      errors.lineOfBusiness = 'At least one line of business is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const enhanceStory = async () => {
    if (!validateFields()) {
      return;
    }
    
    setIsEnhancing(true);
    setShowSparkles(true);
    setError('');
    setIsEnhancedStoryVisible(true);
    setIsEnhancedStoryEditable(false);
    setIsEnhancedStoryTransitioning(false);
    
    try {
      const response = await fetch('/api/enhance-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantName: story.merchantName,
          notes: story.notes,
          additionalPrompt: additionalPrompt 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance story');
      }

      const data = await response.json();
      
      setStory({
        ...story,
        enhancedStory: data.enhancedStory as string
      });
      
      setShowSparkles(false);
      setIsEnhancedStoryEditable(true);
    
    } catch (error) {
      console.error('Error enhancing story:', error);
      setError(error instanceof Error ? error.message : 'Failed to enhance story. Please try again.');
    } finally {
      setIsEnhancing(false);
      setIsUpdating(false);
    }
  };

  const handleUpdateStory = async () => {
    if (!validateFields()) return;
    
    setIsUpdating(true);
    setShowSparkles(true);
    
    try {
      const response = await fetch('/api/enhance-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...story,
          additionalPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update story');
      }

      const data = await response.json();
      setStory({
        ...story,
        enhancedStory: data.enhancedStory as string,
      });
      setAdditionalPrompt('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the story');
    } finally {
      setIsUpdating(false);
      setShowSparkles(false);
    }
  };

  const submitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) {
      return;
    }
    
    setIsSubmitting(true);
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

      setShowCelebration(true);
      
      // Reset the form after a delay
      setTimeout(() => {
        const emptyStory: Story = {
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
        };
        
        setStory(emptyStory);
        setAdditionalPrompt('');
        setShowCelebration(false);
        window.dispatchEvent(new Event('storySubmitted'));
      }, 4000);
      
    } catch (err) {
      console.error('Error submitting story:', err);
      setError('Failed to submit story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-card">
      <Sparkles isActive={showSparkles} />
      <Celebration isActive={showCelebration} consultantName={story.launchConsultant} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={submitStory} className="space-y-6">
          <div>
            <label htmlFor="launchConsultant" className="block p-text font-medium mb-2">
              Launch Consultant
            </label>
            <input
              type="text"
              id="launchConsultant"
              value={story.launchConsultant}
              onChange={(e) => setStory({ ...story, launchConsultant: e.target.value })}
              className="p-input w-full"
              placeholder="Enter your name"
            />
            {fieldErrors.launchConsultant && (
              <p className="p-text p-text-subdued mt-1">{fieldErrors.launchConsultant}</p>
            )}
          </div>

          <div>
            <label htmlFor="merchantName" className="block p-text font-medium mb-2">
              Merchant Name
            </label>
            <input
              type="text"
              id="merchantName"
              value={story.merchantName}
              onChange={(e) => setStory({ ...story, merchantName: e.target.value })}
              className="p-input w-full"
              placeholder="Enter merchant name"
            />
            {fieldErrors.merchantName && (
              <p className="p-text p-text-subdued mt-1">{fieldErrors.merchantName}</p>
            )}
          </div>

          <div>
            <label htmlFor="submissionDate" className="block p-text font-medium mb-2">
              Submission Date
            </label>
            <input
              type="date"
              id="submissionDate"
              value={story.submissionDate}
              onChange={(e) => setStory({ ...story, submissionDate: e.target.value })}
              className="p-input w-full"
            />
            {fieldErrors.submissionDate && (
              <p className="p-text p-text-subdued mt-1">{fieldErrors.submissionDate}</p>
            )}
          </div>

          <div>
            <label className="block p-text font-medium mb-2">
              Merchant Segment
            </label>
            <div className="flex flex-wrap gap-4">
              {['Mid-Market', 'Large', 'Enterprise'].map((segment) => (
                <label key={segment} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="merchantSegment"
                    checked={story.storeType === segment}
                    onChange={() => handleMerchantSegmentChange(segment)}
                    className="p-input"
                  />
                  <span className="p-text">{segment}</span>
                </label>
              ))}
            </div>
            {fieldErrors.storeType && (
              <p className="p-text p-text-subdued mt-1">{fieldErrors.storeType}</p>
            )}
          </div>

          <div>
            <label className="block p-text font-medium mb-2">
              Line of Business
            </label>
            <div className="flex flex-wrap gap-4">
              {['D2C', 'B2B', 'POS Pro'].map((business) => (
                <label key={business} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={story.lineOfBusiness?.includes(business) || false}
                    onChange={(e) => handleLineOfBusinessChange(business, e.target.checked)}
                    className="p-input"
                  />
                  <span className="p-text">{business}</span>
                </label>
              ))}
            </div>
            {fieldErrors.lineOfBusiness && (
              <p className="p-text p-text-subdued mt-1">{fieldErrors.lineOfBusiness}</p>
            )}
          </div>

          <div>
            <label htmlFor="gmv" className="block p-text font-medium mb-2">
              GMV
            </label>
            <input
              type="text"
              id="gmv"
              value={story.gmv}
              onChange={(e) => setStory({ ...story, gmv: e.target.value })}
              className="p-input w-full"
              placeholder="Enter GMV"
            />
            {fieldErrors.gmv && (
              <p className="p-text p-text-subdued mt-1">{fieldErrors.gmv}</p>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block p-text font-medium mb-2">
              Story Notes
            </label>
            <textarea
              id="notes"
              value={story.notes}
              onChange={(e) => setStory({ ...story, notes: e.target.value })}
              className="p-input w-full"
              rows={4}
              placeholder="Enter your story notes"
            />
            {fieldErrors.notes && (
              <p className="p-text p-text-subdued mt-1">{fieldErrors.notes}</p>
            )}
          </div>

          {story.enhancedStory && (
            <div>
              <label htmlFor="additionalPrompt" className="block p-text font-medium mb-2">
                Additional Instructions
              </label>
              <textarea
                id="additionalPrompt"
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                className="p-input w-full"
                rows={2}
                placeholder="Add instructions to improve the story..."
              />
            </div>
          )}

          {error && (
            <div className="p-badge p-badge-critical">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={story.enhancedStory ? handleUpdateStory : enhanceStory}
              className="p-button"
              disabled={isEnhancing || isUpdating}
            >
              {isEnhancing || isUpdating ? 'Processing...' : story.enhancedStory ? 'Update Story' : 'Enhance Story'}
            </button>
            <button
              type="submit"
              className="p-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Story'}
            </button>
          </div>
        </form>

        {story.enhancedStory && (
          <div className="p-card bg-[var(--p-color-bg-surface)] rounded-[var(--p-border-radius-base)] shadow-[var(--p-shadow-card)] border border-[var(--p-color-border-subdued)]">
            <div className="p-[var(--p-space-4)]">
              <h3 className="p-text font-medium mb-4">Enhanced Story</h3>
              <textarea
                value={story.enhancedStory}
                onChange={(e) => setStory({ ...story, enhancedStory: e.target.value })}
                className="p-input w-full min-h-[400px] bg-[var(--p-color-bg-surface-secondary)]"
                placeholder="Enhanced story will appear here..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 