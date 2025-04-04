import { useState, useEffect } from 'react';

interface Contributor {
  name: string;
  submissions: number;
  rank: number;
}

interface LeaderBoardProps {
  currentConsultant?: string;
}

export function LeaderBoard({ currentConsultant }: LeaderBoardProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/leaderboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      const data = await response.json();
      setContributors(data.contributors || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  // Listen for the storySubmitted event
  useEffect(() => {
    const handleStorySubmitted = () => {
      console.log('Story submitted event received, refreshing leaderboard');
      fetchLeaderboardData();
    };
    
    window.addEventListener('storySubmitted', handleStorySubmitted);

    return () => {
      window.removeEventListener('storySubmitted', handleStorySubmitted);
    };
  }, []);

  return (
    <div className="p-card bg-[var(--p-color-bg-surface)]/95 backdrop-blur-lg rounded-[var(--p-border-radius-large)] p-[var(--p-space-8)] h-full flex flex-col">
      <h2 className="text-xl font-bold text-[var(--p-color-text-primary)] mb-[var(--p-space-6)]">
        Top Contributors
      </h2>
      
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--p-color-border-primary)]"></div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-[var(--p-color-text-critical)]">
          {error}
        </div>
      ) : contributors.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[var(--p-color-text-subdued)]">
          No submissions yet
        </div>
      ) : (
        <div className="flex-1 space-y-[var(--p-space-4)]">
          {contributors.map((contributor) => (
            <div
              key={`${contributor.name}-${contributor.rank}`}
              className={`flex items-center justify-between p-[var(--p-space-4)] rounded-[var(--p-border-radius-base)] bg-[var(--p-color-bg-surface-secondary)] border border-[var(--p-color-border-subdued)] transition-all duration-200 hover:border-[var(--p-color-border-primary)] ${
                currentConsultant === contributor.name ? 'border-[var(--p-color-border-primary)]' : ''
              }`}
            >
              <div className="flex items-center space-x-[var(--p-space-4)] flex-1 min-w-0">
                <div className={`
                  w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-[var(--p-color-text-on-primary)] font-semibold
                  ${contributor.rank === 1 ? 'bg-[#FFD700]' :
                    contributor.rank === 2 ? 'bg-[#C0C0C0]' :
                    contributor.rank === 3 ? 'bg-[#CD7F32]' :
                    contributor.rank === 4 ? 'bg-[#4169E1]' :
                    contributor.rank === 5 ? 'bg-[#50C878]' :
                    contributor.rank === 6 ? 'bg-[#FFA500]' :
                    contributor.rank === 7 ? 'bg-[#DC143C]' :
                    contributor.rank === 8 ? 'bg-[#6A5ACD]' :
                    contributor.rank === 9 ? 'bg-[#008080]' :
                    contributor.rank === 10 ? 'bg-[#FF1493]' :
                    'bg-[#4169E1]'} // Default to Royal Blue for ranks beyond 10
                `}>
                  {contributor.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[var(--p-color-text)] font-medium block text-base">
                    {contributor.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-[var(--p-space-2)] flex-shrink-0 ml-[var(--p-space-6)]">
                <span className="text-[var(--p-color-text)] font-medium text-base">
                  {contributor.submissions}
                </span>
                <span className="text-sm text-[var(--p-color-text-subdued)] whitespace-nowrap">
                  stories
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-[var(--p-space-8)] text-center text-sm text-[var(--p-color-text-subdued)]">
        Share your story and join the leaderboard!
      </div>
    </div>
  );
} 