import React from 'react';
import { Moon, Sun, Menu, User, Bell } from 'lucide-react';
import { useTheme } from '../../app/theme/theme-context';
import { Button } from '../Button';
import { DropdownMenu } from '../Dropdown';

export const Header: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
        </button>

        {/* Page title/breadcrumb area */}
        <div className="flex-1 md:flex-initial min-w-0">
          <h2 className="text-h5 font-semibold text-neutral-900 dark:text-neutral-50 truncate">
            Dashboard
          </h2>
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" aria-hidden="true" />
              </Button>
            }
            items={[
              { label: 'No notifications', onClick: () => {}, disabled: true },
            ]}
            align="right"
          />

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>

          {/* User menu */}
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700" aria-hidden="true" />
                <span className="hidden sm:block text-sm font-medium text-neutral-700 dark:text-neutral-300">User</span>
              </Button>
            }
            items={[
              { label: 'Profile', onClick: () => {}, icon: <User className="w-4 h-4" /> },
              { label: 'Settings', onClick: () => {}, icon: <Menu className="w-4 h-4" /> },
              { label: '', onClick: () => {}, divider: true },
              { label: 'Sign out', onClick: () => {}, icon: <Menu className="w-4 h-4" />, danger: true },
            ]}
            align="right"
          />
        </div>
      </div>
    </header>
  );
};