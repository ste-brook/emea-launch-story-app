'use client';

interface StoryPreviewProps {
  story: string;
}

export function StoryPreview({ story }: StoryPreviewProps) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-inner border border-gray-200 dark:border-gray-600">
        <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
          {story}
        </div>
        <div className="mt-6 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Story enhanced with AI
        </div>
      </div>
    </div>
  );
} 