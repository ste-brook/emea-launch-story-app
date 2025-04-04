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
  const [error, setError] = useState('');
  const [showSparkles, setShowSparkles] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isEnhancedStoryVisible, setIsEnhancedStoryVisible] = useState(false);
  const [isEnhancedStoryEditable, setIsEnhancedStoryEditable] = useState(false);
  const [isEnhancedStoryTransitioning, setIsEnhancedStoryTransitioning] = useState(false);

  const [storyState, setStoryState] = useState<Story>({
    ...story,
    submissionDate: story.submissionDate || new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    setStoryState(prev => ({
      ...prev,
      submissionDate: prev.submissionDate || new Date().toISOString().split('T')[0]
    }));
  }, []);

  useEffect(() => {
    setStory(storyState);
  }, [storyState, setStory]);

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

  const validateFields = () => {
    const errors: Record<string, string> = {};
    
    if (!storyState.merchantName) {
      errors.merchantName = 'Merchant name is required';
    }
    
    if (!storyState.notes) {
      errors.notes = 'Story notes are required';
    }

    if (!storyState.launchConsultant) {
      errors.launchConsultant = 'Launch consultant is required';
    }

    if (!storyState.storeType) {
      errors.storeType = 'Merchant segment is required';
    }

    if (!storyState.submissionDate) {
      errors.submissionDate = 'Submission date is required';
    }

    if (!storyState.gmv) {
      errors.gmv = 'GMV is required';
    }

    if (!storyState.lineOfBusiness || storyState.lineOfBusiness.length === 0) {
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
    
    // Show a placeholder enhanced story immediately
    setStoryState(prev => ({
      ...prev,
      enhancedStory: "Enhancing your story... This will be replaced with the AI-enhanced version shortly."
    }));
    
    try {
      const response = await fetch('/api/enhance-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantName: storyState.merchantName,
          notes: storyState.notes,
          additionalPrompt: additionalPrompt 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance story');
      }

      const data = await response.json();
      
      // Keep sparkles visible for 0.6 seconds with a gentle fade-out (reduced by 60% from 1.5 seconds)
      setTimeout(() => {
        setShowSparkles(false);
        // Start the transition to make the enhanced story visible
        setIsEnhancedStoryTransitioning(true);
        
        // Update the enhanced story content
        setStoryState(prev => ({
          ...prev,
          enhancedStory: data.enhancedStory
        }));
        
        if (story) {
          setStory({ ...story, enhancedStory: data.enhancedStory });
        }
        
        // Make the enhanced story fully visible and editable after transition (reduced by 60% from 0.5 seconds)
        setTimeout(() => {
          setIsEnhancedStoryEditable(true);
        }, 200);
      }, 600);
    } catch (error) {
      console.error('Error enhancing story:', error);
      setError(error instanceof Error ? error.message : 'Failed to enhance story. Please try again.');
      // Reset the enhanced story on error
      setStoryState(prev => ({
        ...prev,
        enhancedStory: ""
      }));
    } finally {
      setIsEnhancing(false);
      setIsUpdating(false);
    }
  };

  const handleUpdateStory = () => {
    if (!storyState.enhancedStory) return;
    setIsUpdating(true);
    enhanceStory();
  };

  const submitStory = async () => {
    if (!validateFields()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setShowCelebration(true);

    try {
      const response = await fetch('/api/submit-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyState),
      });

      if (!response.ok) {
        throw new Error(`Error submitting story: ${response.statusText}`);
      }

      const today = new Date().toISOString().split('T')[0];
      const resetStory = {
        merchantName: '',
        submissionDate: today,
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
      
      // Show celebration for exactly 3 seconds before resetting the form
      setTimeout(() => {
        setStoryState(resetStory);
        setStory(resetStory);
        setIsSubmitting(false);
        setShowCelebration(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setError('Error submitting story. Please try again.');
      setIsSubmitting(false);
      setShowCelebration(false);
    }
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl p-8 relative">
      <Sparkles isActive={showSparkles} />
      <Celebration isActive={showCelebration} consultantName={storyState.launchConsultant} />
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
            className={`w-full px-4 py-2 rounded-lg border ${fieldErrors.launchConsultant ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500`}
            placeholder="Enter consultant name"
          />
          {fieldErrors.launchConsultant && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.launchConsultant}</p>
          )}
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
            className={`w-full px-4 py-2 rounded-lg border ${fieldErrors.merchantName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500`}
            placeholder="Enter merchant name"
          />
          {fieldErrors.merchantName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.merchantName}</p>
          )}
        </div>

        <div>
          <label htmlFor="storeType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Merchant Segment
          </label>
          <select
            id="storeType"
            value={storyState.storeType}
            onChange={(e) => setStoryState({ ...storyState, storeType: e.target.value })}
            className={`w-full px-4 py-2 rounded-lg border ${fieldErrors.storeType ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500`}
          >
            <option value="">Select segment</option>
            <option value="Mid-Market">Mid-Market</option>
            <option value="Large">Large</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          {fieldErrors.storeType && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.storeType}</p>
          )}
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
            className={`w-full px-4 py-2 rounded-lg border ${fieldErrors.submissionDate ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500`}
          />
          {fieldErrors.submissionDate && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.submissionDate}</p>
          )}
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
            className={`w-full px-4 py-2 rounded-lg border ${fieldErrors.gmv ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500`}
            placeholder="Enter GMV"
          />
          {fieldErrors.gmv && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.gmv}</p>
          )}
        </div>

        <div>
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
          {fieldErrors.lineOfBusiness && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.lineOfBusiness}</p>
          )}
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
            className={`w-full px-4 py-2 rounded-lg border ${fieldErrors.notes ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500`}
            placeholder="Enter story notes..."
          />
          {fieldErrors.notes && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.notes}</p>
          )}
        </div>

        {storyState.enhancedStory && (
          <div className="md:col-span-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Enhanced Story</h3>
              </div>
              <div className="relative">
                <textarea
                  value={storyState.enhancedStory}
                  readOnly={!isEnhancedStoryEditable}
                  onChange={isEnhancedStoryEditable ? (e) => setStoryState({ ...storyState, enhancedStory: e.target.value }) : undefined}
                  className={`w-full h-64 p-4 border rounded-md ${
                    isEnhancedStoryEditable 
                      ? 'bg-white text-black' 
                      : isEnhancedStoryTransitioning 
                        ? 'bg-gray-50 text-gray-700 transition-all duration-1000' 
                        : 'bg-gray-100 text-gray-600'
                  } transition-all duration-500`}
                  placeholder="Enhanced story will appear here..."
                />
                {isEnhancing && <Sparkles isActive={true} />}
              </div>
            </div>
          </div>
        )}

        {storyState.enhancedStory && (
          <div className="md:col-span-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Instructions for Update
              </label>
              <textarea
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                placeholder="Enter specific instructions for how you'd like the story to be updated..."
                className="w-full p-4 border rounded-md bg-white text-black dark:bg-white dark:text-black"
                rows={3}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6 md:col-span-2">
          <button
            type="button"
            onClick={storyState.enhancedStory ? handleUpdateStory : enhanceStory}
            disabled={isEnhancing || isSubmitting || !storyState.notes || (storyState.enhancedStory && !additionalPrompt)}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 rounded-lg hover:from-indigo-700 hover:via-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isEnhancing 
              ? (storyState.enhancedStory ? 'Updating...' : 'Enhancing...')
              : (storyState.enhancedStory ? 'Update Story' : 'Enhance Story')}
          </button>

          <button
            type="submit"
            onClick={submitStory}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Story'}
          </button>
        </div>

        {error && (
          <div className="md:col-span-2 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 