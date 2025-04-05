'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from './Sparkles';
import { Celebration } from './Celebration';
import SparklyButton from './SparklyButton';

type BusinessType = 'D2C' | 'B2B' | 'POS Pro';

interface Story {
  merchantName: string;
  submissionDate: string;
  notes: string;
  enhancedStory: string;
  launchConsultant: string;
  team: string;
  salesforceCaseLink: string;
  lineOfBusiness: BusinessType[];
  gmv: {
    D2C?: string;
    B2B?: string;
    'POS Pro'?: string;
  };
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
        ? [...(story.lineOfBusiness || []), business as BusinessType]
        : (story.lineOfBusiness || []).filter((b: BusinessType) => b !== business as BusinessType),
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

    if (!story.salesforceCaseLink) {
      errors.salesforceCaseLink = 'Salesforce case link is required';
    }

    if (!story.storeType) {
      errors.storeType = 'Merchant segment is required';
    }

    if (!story.submissionDate) {
      errors.submissionDate = 'Submission date is required';
    }

    if (!story.lineOfBusiness || story.lineOfBusiness.length === 0) {
      errors.lineOfBusiness = 'At least one line of business is required';
    }

    // Validate GMV for each selected business type
    story.lineOfBusiness.forEach((business: BusinessType) => {
      if (!story.gmv[business]) {
        errors[`gmv_${business}`] = `GMV for ${business} is required`;
      }
    });
    
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
          gmv: {},
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={submitStory} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="launchConsultant" className="block p-text font-medium mb-2 text-sm">
                Launch Consultant
              </label>
              <input
                type="text"
                id="launchConsultant"
                value={story.launchConsultant}
                onChange={(e) => setStory({ ...story, launchConsultant: e.target.value })}
                className="p-input w-full py-2"
                placeholder="Enter your name"
              />
              {fieldErrors.launchConsultant && (
                <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors.launchConsultant}</p>
              )}
            </div>

            <div>
              <label htmlFor="merchantName" className="block p-text font-medium mb-2 text-sm">
                Merchant Name
              </label>
              <input
                type="text"
                id="merchantName"
                value={story.merchantName}
                onChange={(e) => setStory({ ...story, merchantName: e.target.value })}
                className="p-input w-full py-2"
                placeholder="Enter merchant name"
              />
              {fieldErrors.merchantName && (
                <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors.merchantName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="salesforceCaseLink" className="block p-text font-medium mb-2 text-sm">
                Salesforce Case Link
              </label>
              <input
                type="text"
                id="salesforceCaseLink"
                value={story.salesforceCaseLink}
                onChange={(e) => setStory({ ...story, salesforceCaseLink: e.target.value })}
                className="p-input w-full py-2"
                placeholder="Enter Salesforce case link"
              />
              {fieldErrors.salesforceCaseLink && (
                <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors.salesforceCaseLink}</p>
              )}
            </div>

            <div>
              <label htmlFor="submissionDate" className="block p-text font-medium mb-2 text-sm">
                Submission Date
              </label>
              <input
                type="date"
                id="submissionDate"
                value={story.submissionDate}
                onChange={(e) => setStory({ ...story, submissionDate: e.target.value })}
                className="p-input w-full py-2"
              />
              {fieldErrors.submissionDate && (
                <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors.submissionDate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block p-text font-medium mb-2 text-sm">
                Merchant Segment
              </label>
              <div className="flex gap-4">
                {['Mid-Market', 'Large'].map((segment) => (
                  <label key={segment} className="flex items-center cursor-pointer no-underline">
                    <input
                      type="radio"
                      name="merchantSegment"
                      checked={story.storeType === segment}
                      onChange={() => handleMerchantSegmentChange(segment)}
                      className="p-input"
                    />
                    <span className="p-text text-sm no-underline ml-2">{segment}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.storeType && (
                <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors.storeType}</p>
              )}
            </div>

            <div>
              <label className="block p-text font-medium mb-2 text-sm">
                Line of Business
              </label>
              <div className="flex flex-wrap gap-4">
                {['D2C', 'B2B', 'POS Pro'].map((business) => (
                  <label key={business} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={story.lineOfBusiness?.includes(business as BusinessType) || false}
                      onChange={(e) => handleLineOfBusinessChange(business, e.target.checked)}
                      className="p-input"
                    />
                    <span className="p-text text-sm">{business}</span>
                  </label>
                ))}
              </div>
              {fieldErrors.lineOfBusiness && (
                <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors.lineOfBusiness}</p>
              )}
            </div>
          </div>

          {story.lineOfBusiness.length > 0 && (
            <div className="mt-4">
              <label className="block p-text font-medium mb-2 text-sm">
                GMV by Business Type
              </label>
              <div className="space-y-4">
                {story.lineOfBusiness.includes('D2C') && (
                  <div>
                    <label htmlFor="gmv_d2c" className="block p-text text-sm mb-2">
                      D2C GMV
                    </label>
                    <input
                      type="text"
                      id="gmv_d2c"
                      value={story.gmv.D2C || ''}
                      onChange={(e) => setStory({
                        ...story,
                        gmv: { ...story.gmv, D2C: e.target.value }
                      })}
                      className="p-input w-full py-2"
                      placeholder="Enter D2C GMV"
                    />
                    {fieldErrors.gmv_D2C && (
                      <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors.gmv_D2C}</p>
                    )}
                  </div>
                )}
                {story.lineOfBusiness.includes('B2B') && (
                  <div>
                    <label htmlFor="gmv_b2b" className="block p-text text-sm mb-2">
                      B2B GMV
                    </label>
                    <input
                      type="text"
                      id="gmv_b2b"
                      value={story.gmv.B2B || ''}
                      onChange={(e) => setStory({
                        ...story,
                        gmv: { ...story.gmv, B2B: e.target.value }
                      })}
                      className="p-input w-full py-2"
                      placeholder="Enter B2B GMV"
                    />
                    {fieldErrors.gmv_B2B && (
                      <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors.gmv_B2B}</p>
                    )}
                  </div>
                )}
                {story.lineOfBusiness.includes('POS Pro') && (
                  <div>
                    <label htmlFor="gmv_pos" className="block p-text text-sm mb-2">
                      POS Pro GMV
                    </label>
                    <input
                      type="text"
                      id="gmv_pos"
                      value={story.gmv['POS Pro'] || ''}
                      onChange={(e) => setStory({
                        ...story,
                        gmv: { ...story.gmv, 'POS Pro': e.target.value }
                      })}
                      className="p-input w-full py-2"
                      placeholder="Enter POS Pro GMV"
                    />
                    {fieldErrors.gmv_POS_Pro && (
                      <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors.gmv_POS_Pro}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="notes" className="block p-text font-medium mb-2 text-sm">
              Story Notes
            </label>
            <textarea
              id="notes"
              value={story.notes}
              onChange={(e) => setStory({ ...story, notes: e.target.value })}
              className="p-input w-full py-2"
              rows={4}
              placeholder="Enter your story notes"
            />
            {fieldErrors.notes && (
              <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors.notes}</p>
            )}
          </div>

          {error && (
            <div className="p-badge p-badge-critical text-xs p-2">
              {error}
            </div>
          )}

          {!story.enhancedStory && (
            <div className="flex justify-start pt-4">
              <button
                onClick={enhanceStory}
                disabled={isEnhancing}
                className="p-button p-button-primary py-2 px-4 text-sm"
              >
                {isEnhancing ? 'Processing...' : 'Enhance Story'}
              </button>
            </div>
          )}
        </form>

        <div className="p-card bg-[var(--p-color-bg-surface)] rounded-[var(--p-border-radius-base)] shadow-[var(--p-shadow-card)] border border-[var(--p-color-border-subdued)]">
          <div className="p-[var(--p-space-4)]">
            <h3 className="p-text font-medium mb-4 text-sm">Enhanced Story</h3>
            {story.enhancedStory ? (
              <>
                <textarea
                  value={story.enhancedStory}
                  onChange={(e) => setStory({ ...story, enhancedStory: e.target.value })}
                  className="p-input w-full min-h-[300px] bg-[var(--p-color-bg-surface-secondary)] text-sm p-4"
                  placeholder="Enhanced story will appear here..."
                />
                
                <div className="mt-6">
                  <label htmlFor="additionalPrompt" className="block p-text font-medium mb-2 text-sm">
                    Additional Instructions
                  </label>
                  <textarea
                    id="additionalPrompt"
                    value={additionalPrompt}
                    onChange={(e) => setAdditionalPrompt(e.target.value)}
                    className="p-input w-full p-2"
                    rows={2}
                    placeholder="Add instructions to improve the story..."
                  />
                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={handleUpdateStory}
                      disabled={isEnhancing || isUpdating}
                      className="p-button p-button-primary py-2 px-4 text-sm"
                    >
                      {isEnhancing || isUpdating ? 'Processing...' : 'Update Story'}
                    </button>
                    
                    <button
                      type="submit"
                      onClick={submitStory}
                      className="p-button p-button-primary gold-button py-2 px-4 text-sm"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Story'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="min-h-[300px] bg-[var(--p-color-bg-surface-secondary)] rounded-[var(--p-border-radius-base)] p-[var(--p-space-4)] flex flex-col items-center justify-center text-center">
                <div className="text-[var(--p-color-text-subdued)] mb-[var(--p-space-4)]">
                  <svg className="w-12 h-12 mx-auto mb-[var(--p-space-3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-base font-medium mb-[var(--p-space-2)]">Your Enhanced Story Awaits</p>
                  <p className="text-xs">Fill in the story details and click "Enhance Story" to generate an AI-powered version of your success story.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 