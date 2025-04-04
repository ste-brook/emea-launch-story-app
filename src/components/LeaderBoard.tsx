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
  // This would eventually come from your API/database
  const [contributors, setContributors] = useState<Contributor[]>([]);

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl p-8 h-full flex flex-col">
      <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
        Top Contributors
      </h2>
      <div className="flex-1 space-y-4">
        {contributors.map((contributor) => (
          <div
            key={`${contributor.name}-${contributor.rank}`}
            className={`flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:border-purple-400 dark:hover:border-purple-500 ${
              currentConsultant === contributor.name ? 'border-purple-400 dark:border-purple-500' : ''
            }`}
          >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className={`
                w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-white font-semibold
                ${contributor.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  contributor.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                  contributor.rank === 3 ? 'bg-gradient-to-r from-amber-700 to-amber-800' :
                  'bg-gradient-to-r from-purple-600 to-indigo-600'}
              `}>
                {contributor.rank}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-gray-900 dark:text-gray-100 font-medium block truncate text-base">
                  {contributor.name}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-6">
              <span className="text-gray-600 dark:text-gray-400 font-medium text-base">
                {contributor.submissions}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-500 whitespace-nowrap">
                stories
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Share your story and join the leaderboard!
      </div>
    </div>
  );
} 