import React from 'react';

interface FeatureSuggestion {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

const FeatureSuggestions: React.FC = () => {
  const suggestions: FeatureSuggestion[] = [
    {
      id: 1,
      title: 'Real-time Match Updates',
      description: 'Get live score updates and match commentary as games unfold',
      icon: '⚡',
      category: 'Core',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Fantasy Cricket',
      description: 'Create fantasy teams and compete against friends',
      icon: '🎯',
      category: 'Entertainment',
      priority: 'high'
    },
    {
      id: 3,
      title: 'Player Comparison',
      description: 'Compare stats and performance between different players',
      icon: '📊',
      category: 'Analytics',
      priority: 'medium'
    },
    {
      id: 4,
      title: 'Video Highlights',
      description: 'Watch key moments and highlights from matches',
      icon: '🎬',
      category: 'Media',
      priority: 'medium'
    },
    {
      id: 5,
      title: 'Social Sharing',
      description: 'Share match results and scores on social media',
      icon: '📤',
      category: 'Social',
      priority: 'low'
    },
    {
      id: 6,
      title: 'Push Notifications',
      description: 'Get notified about upcoming matches and important updates',
      icon: '🔔',
      category: 'Notifications',
      priority: 'medium'
    },
    {
      id: 7,
      title: 'Team Analytics',
      description: 'Deep dive into team performance metrics and trends',
      icon: '📈',
      category: 'Analytics',
      priority: 'high'
    },
    {
      id: 8,
      title: 'Match Prediction',
      description: 'Predict match outcomes and earn points',
      icon: '🔮',
      category: 'Entertainment',
      priority: 'low'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Core': return 'bg-blue-100 text-blue-800';
      case 'Entertainment': return 'bg-purple-100 text-purple-800';
      case 'Analytics': return 'bg-indigo-100 text-indigo-800';
      case 'Media': return 'bg-pink-100 text-pink-800';
      case 'Social': return 'bg-teal-100 text-teal-800';
      case 'Notifications': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="feature-suggestions bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🚀 Feature Suggestions</h2>
        <span className="text-sm text-gray-500">Based on user feedback</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion) => (
          <div 
            key={suggestion.id} 
            className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{suggestion.icon}</span>
                <h3 className="font-bold text-gray-800">{suggestion.title}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{suggestion.description}</p>
            
            <div className="flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(suggestion.category)}`}>
                {suggestion.category}
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Learn More →
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105">
          Request New Feature
        </button>
      </div>
    </div>
  );
};

export default FeatureSuggestions;