'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from './Sparkles';
import { Celebration } from './Celebration';
import SparklyButton from './SparklyButton';

const LAUNCH_CONSULTANTS = [
  'Allesandro Baglivo',
  'Alica Diana',
  'Ania Kowalska',
  'Astrid Balza',
  'Frankie Lodge',
  'Jack Rapley',
  'Khalid Chao',
  'Leslie Ludwig',
  'Lou Dennehy',
  'Niklas Hermsdorf',
  'Sam Zeender',
  'Sandra Conway',
  'Sascha Engel',
  'Stephen Brook',
  'Tadib Muqtada',
  'Valeria Honta'
].sort();

export type BusinessType = 'D2C' | 'B2B' | 'POS Pro';

export interface Story {
  merchantName: string;
  launchConsultant: string;
  salesforceCaseLink: string;
  opportunityRevenue: string;
  launchStatus: string;
  launchDate: string;
  lineOfBusiness: BusinessType[];
  gmv: Partial<Record<BusinessType, string>>;
  notes: string;
  enhancedStory: string;
  team: string;
}

interface StoryFormProps {
  story: Story;
  setStory: (story: Story) => void;
}

type GmvType = Partial<Record<BusinessType, string>>;
type GmvFieldErrorKey = `gmv_${BusinessType}`;
type FieldErrorsType = Partial<Record<GmvFieldErrorKey | string, string>>;

export function StoryForm({ story, setStory }: StoryFormProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorsType>({});
  const [isEnhancedStoryVisible, setIsEnhancedStoryVisible] = useState(false);
  const [isEnhancedStoryEditable, setIsEnhancedStoryEditable] = useState(false);
  const [isEnhancedStoryTransitioning, setIsEnhancedStoryTransitioning] = useState(false);
  const [formattedGmv, setFormattedGmv] = useState<Record<BusinessType, string>>({} as Record<BusinessType, string>);

  const getGmvTooltip = (business: BusinessType) => {
    switch(business) {
      case 'D2C':
        return 'Salesforce Opportunity > Revenue Detail > Opp D2C Revenue Verified';
      case 'B2B':
        return 'Salesforce Opportunity > Revenue Detail > Opp B2B Revenue Verified';
      case 'POS Pro':
        return 'Salesforce Opportunity > Revenue Detail > Opp Retail Revenue Verified';
      default:
        return '';
    }
  };

  // Format GMV value to include commas for thousands
  const formatGmvValue = (value: string): string => {
    // Remove any non-numeric characters except commas
    const cleanValue = value.replace(/[^0-9,]/g, '');
    // Remove all commas and then add them back in the correct positions
    const number = cleanValue.replace(/,/g, '');
    if (!number) return '';
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse GMV value for calculations (removes commas)
  const parseGmvValue = (value: string): number => {
    return parseInt(value.replace(/,/g, ''), 10) || 0;
  };

  const handleLineOfBusinessChange = (business: string, checked: boolean) => {
    const newLineOfBusiness = checked
      ? [...(story.lineOfBusiness || []), business as BusinessType]
      : (story.lineOfBusiness || []).filter((b: BusinessType) => b !== business as BusinessType);
    
    const newGmv = { ...story.gmv };
    if (checked) {
      // Initialize GMV for newly selected business
      newGmv[business as BusinessType] = '';
    } else {
      // Remove GMV for unselected business
      delete newGmv[business as BusinessType];
    }
    
    setStory({
      ...story,
      lineOfBusiness: newLineOfBusiness,
      gmv: newGmv
    });
  };

  const handleGmvChange = (business: BusinessType, value: string) => {
    const formattedValue = formatGmvValue(value);
    const newGmv: GmvType = { ...story.gmv };
    newGmv[business] = formattedValue;
    setStory({ ...story, gmv: newGmv });

    // Clear any existing error for this field
    const errorKey = `gmv_${business}`;
    const updatedErrors = { ...fieldErrors };
    if (errorKey in updatedErrors) {
      delete updatedErrors[errorKey];
      setFieldErrors(updatedErrors);
    }
  };

  const validateGmv = (business: BusinessType): boolean => {
    const gmvValue = story.gmv[business];
    if (!gmvValue || gmvValue.trim() === '') {
      const errorKey = `gmv_${business}`;
      setFieldErrors(prev => ({
        ...prev,
        [errorKey]: `Please enter the GMV for ${business}`
      }));
      return false;
    }
    return true;
  };

  const handleLaunchStatusChange = (status: string) => {
    setStory({
      ...story,
      launchStatus: status,
    });
  };

  const handleOpportunityRevenueChange = (value: string) => {
    const formattedValue = formatGmvValue(value);
    setStory({ ...story, opportunityRevenue: formattedValue });

    // Clear any existing error for this field
    const updatedErrors = { ...fieldErrors };
    if ('opportunityRevenue' in updatedErrors) {
      delete updatedErrors['opportunityRevenue'];
      setFieldErrors(updatedErrors);
    }
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

    if (!story.launchStatus) {
      errors.launchStatus = 'Launch status is required';
    }

    if (!story.lineOfBusiness || story.lineOfBusiness.length === 0) {
      errors.lineOfBusiness = 'At least one line of business is required';
    }

    // Validate GMV for each selected business type
    story.lineOfBusiness.forEach((business: BusinessType) => {
      const gmvValue = story.gmv[business];
      if (!gmvValue) {
        errors[`gmv_${business}`] = `GMV for ${business} is required`;
      } else {
        // Check if the GMV value contains only numbers and properly formatted commas
        if (!/^\d{1,3}(,\d{3})*$/.test(gmvValue)) {
          errors[`gmv_${business}`] = `GMV for ${business} should be a number with optional thousands separators (e.g., 1,000,000)`;
        }
        // Check if the value is too large (prevent integer overflow)
        const numericValue = parseGmvValue(gmvValue);
        if (numericValue > Number.MAX_SAFE_INTEGER) {
          errors[`gmv_${business}`] = `GMV value is too large`;
        }
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
    <div className="p-card w-full">
      <Sparkles isActive={showSparkles} />
      <Celebration isActive={showCelebration} consultantName={story.launchConsultant} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={submitStory} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="launchConsultant" className="block p-text font-medium mb-2 text-sm">
                Launch Consultant
              </label>
              <div className="relative">
                <select
                id="launchConsultant"
                value={story.launchConsultant}
                onChange={(e) => setStory({ ...story, launchConsultant: e.target.value })}
                  className="p-input w-full py-2 appearance-none bg-white pr-8"
                >
                  <option value="">Select consultant</option>
                  {LAUNCH_CONSULTANTS.map((consultant) => (
                    <option key={consultant} value={consultant}>
                      {consultant}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
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
              <label htmlFor="opportunityRevenue" className="block p-text font-medium mb-2 text-sm">
                Opportunity Revenue
              </label>
              <div className="relative flex items-center">
              <input
                  id="opportunityRevenue"
                  type="text"
                  value={story.opportunityRevenue}
                  onChange={(e) => handleOpportunityRevenueChange(e.target.value)}
                  className="p-input w-full py-2"
                  placeholder="e.g., 1,000,000"
                />
                <div className="relative ml-2 group">
                  <span className="text-lg text-gray-400 hover:text-gray-500 cursor-help">{'ⓘ'}</span>
                  <div className="absolute hidden group-hover:block z-10 w-64 p-2 mt-2 text-sm text-gray-600 bg-white border rounded shadow-lg -left-24 top-6">
                    Salesforce Opportunity {'>'} Revenue Detail {'>'} Total Retail
                  </div>
                </div>
              </div>
              {fieldErrors.opportunityRevenue && (
                <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors.opportunityRevenue}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block p-text font-medium mb-2 text-sm">
                Launch Status
              </label>
              <div className="relative">
                <select
                  value={story.launchStatus}
                  onChange={(e) => handleLaunchStatusChange(e.target.value)}
                  className="p-input w-full py-2 appearance-none bg-white pr-8"
                >
                  <option value="">Select status</option>
                  <option value="Handover">Handover</option>
                  <option value="Explore">Explore</option>
                  <option value="Build">Build</option>
                  <option value="Test">Test</option>
                  <option value="Launch">Launch</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              {fieldErrors.launchStatus && (
                <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors.launchStatus}</p>
              )}
            </div>

            <div>
              <label className="block p-text font-medium mb-2 text-sm">
                Line of Business
              </label>
              <div className="flex flex-col space-y-3">
                {['D2C', 'B2B', 'POS Pro'].map((business) => (
                  <div key={business} className="flex items-center space-x-3">
                    <label className="flex items-center cursor-pointer w-24">
                    <input
                      type="checkbox"
                        checked={story.lineOfBusiness?.includes(business as BusinessType) || false}
                      onChange={(e) => handleLineOfBusinessChange(business, e.target.checked)}
                      className="p-input"
                    />
                      <span className="p-text text-sm ml-2">{business}</span>
                  </label>
                    
                    {story.lineOfBusiness?.includes(business as BusinessType) && (
                      <div className="flex-1">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            id={`gmv-${business}`}
                            value={story.gmv[business as BusinessType] || ''}
                            onChange={(e) => handleGmvChange(business as BusinessType, e.target.value)}
                            className={`p-input w-full py-2 ${
                              fieldErrors[`gmv_${business}`] ? 'border-red-500' : ''
                            }`}
                            placeholder={`${business} GMV`}
                          />
                          <div className="relative ml-2 group">
                            <span className="text-lg text-gray-400 hover:text-gray-500 cursor-help">{'ⓘ'}</span>
                            <div className="absolute hidden group-hover:block z-10 w-64 p-2 mt-2 text-sm text-gray-600 bg-white border rounded shadow-lg -left-24 top-6">
                              {getGmvTooltip(business as BusinessType)}
                            </div>
                          </div>
                        </div>
                        {fieldErrors[`gmv_${business}`] && (
                          <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors[`gmv_${business}`]}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {fieldErrors.lineOfBusiness && (
                <p className="p-text p-text-critical mt-2 text-xs">{fieldErrors.lineOfBusiness}</p>
              )}
            </div>
          </div>

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