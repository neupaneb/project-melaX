import React from 'react';
import { Button } from './ui/button';
import { Moon, Sun, Monitor, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'outline',
  size = 'default',
  showLabel = false
}) => {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'auto') {
      return <Monitor className="w-4 h-4" />;
    }
    return actualTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (theme === 'auto') {
      return 'Auto';
    }
    return actualTheme === 'dark' ? 'Light' : 'Dark';
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={variant}
        size={size}
        onClick={toggleTheme}
        className={showLabel ? 'flex items-center space-x-2' : 'h-10 w-10 p-0 flex items-center justify-center'}
        title={`Switch to ${actualTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {getIcon()}
        {showLabel && <span>{getLabel()}</span>}
      </Button>

      <div className="relative group">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0 flex items-center justify-center"
          title="Theme options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>

        <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="py-1">
            <button
              onClick={() => setTheme('light')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 text-gray-900 dark:text-gray-100 ${
                theme === 'light' ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
            >
              <Sun className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 text-gray-900 dark:text-gray-100 ${
                theme === 'dark' ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
            >
              <Moon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setTheme('auto')}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center space-x-2 text-gray-900 dark:text-gray-100 ${
                theme === 'auto' ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
            >
              <Monitor className="w-4 h-4 text-green-500 dark:text-green-400" />
              <span>Auto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
