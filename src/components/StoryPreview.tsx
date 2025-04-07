'use client';

interface StoryPreviewProps {
  story: string;
}

export function StoryPreview({ story }: StoryPreviewProps) {
  return (
    <div className="p-card max-w-none">
      <div className="bg-[var(--p-color-bg-surface)] rounded-[var(--p-border-radius-base)] p-[var(--p-space-8)] shadow-[var(--p-shadow-card)] border border-[var(--p-color-border-subdued)]">
        <div className="whitespace-pre-wrap text-[var(--p-color-text)] leading-relaxed">
          {story}
        </div>
        <div className="mt-[var(--p-space-6)] flex items-center text-[var(--p-color-text-subdued)] text-sm">
          <svg className="h-5 w-5 mr-[var(--p-space-2)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Story enhanced with AI
        </div>
      </div>
    </div>
  );
} 