import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../main';
import { useTheme } from '../../app/theme/theme-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

type UserRole = 'admin' | 'controller' | 'technician' | null;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNoRoleModal, setShowNoRoleModal] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!supabase) {
      setError('Authentication service not available');
    }
  }, []);

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data?.role as UserRole;
    } catch (err) {
      console.error('Error fetching user role:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!supabase) {
      setError('Authentication service not available');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      const userRole = await fetchUserRole(user.id);

      if (!userRole || (userRole !== 'admin' && userRole !== 'controller' && userRole !== 'technician')) {
        setShowNoRoleModal(true);
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      const routes: Record<string, string> = {
        admin: '/admin/dashboard',
        controller: '/controller/dashboard',
        technician: '/technician/dashboard',
      };
      navigate(routes[userRole!]);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 transition-all duration-300">
        {/* Theme toggle */}
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9 9 0 0115.354 8.646 9 9 0 0120.354 15.354z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
              <span className="text-white font-bold text-xl">A</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">AOLMS</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Automated Order & Logistics Management System</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            error={error && !error.includes('role') ? error : undefined}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            error={error && !error.includes('role') ? error : undefined}
          />

          {error && error.includes('role') && (
            <div className="rounded-lg bg-warning-50 dark:bg-warning-950/30 p-4 border border-warning-200 dark:border-warning-800">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-warning-800 dark:text-warning-200">Role Not Found</h3>
                  <p className="text-sm text-warning-700 dark:text-warning-300 mt-0.5">Login successful, but your account has no valid role assigned.</p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-6"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} AOLMS · All rights reserved ·{' '}
            <a href="mailto:support@aolms.com" className="text-primary-600 dark:text-primary-400 hover:underline">Support</a>
          </p>
        </div>
      </div>

      {showNoRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-warning-100 dark:bg-warning-950/30 rounded-full mb-4">
              <svg className="w-6 h-6 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 text-center mb-2">Role Not Found</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center mb-6">
              Login successful! Your account does not have a valid role assigned (Admin, Controller, or Technician).
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => setShowNoRoleModal(false)} variant="primary" className="w-full">
                Understood
              </Button>
              <a href="mailto:admin@aolms.com" className="block">
                <Button variant="outline" className="w-full">
                  Contact Administrator
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;