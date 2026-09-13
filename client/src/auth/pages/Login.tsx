import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../main';
import { useTheme } from '../../app/theme/theme-context';

type UserRole = 'admin' | 'controller' | 'technician' | null;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNoRoleModal, setShowNoRoleModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Login component mounted');
    if (!supabase) {
      console.error('Supabase client not initialized');
    }
  }, []);

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    if (!supabase) return null;

    try {
      // Fetch role from profiles table
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
      console.log('Attempting to sign in with:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Sign in successful');
      // Get user profile to determine role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Fetch role from profiles table
      const userRole = await fetchUserRole(user.id);
      console.log('User role from profiles:', userRole);

      // Check if role is valid
      if (!userRole || (userRole !== 'admin' && userRole !== 'controller' && userRole !== 'technician')) {
        // Show styled custom modal for valid login but no role found
        setShowNoRoleModal(true);
        // Clear the session since no valid role
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      // Redirect based on role
      switch (userRole) {
        case 'admin':
          console.log('Redirecting to admin dashboard');
          navigate('/admin/dashboard');
          break;
        case 'controller':
          console.log('Redirecting to controller dashboard');
          navigate('/controller/dashboard');
          break;
        case 'technician':
          console.log('Redirecting to technician dashboard');
          navigate('/technician/dashboard');
          break;
        default:
          console.log('Redirecting to login');
          navigate('/login');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-900)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] p-8 rounded-lg shadow-md dark:shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex justify-end">
            <button
              onClick={() => useTheme().toggleTheme()}
              className="flex items-center text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-900)] dark:hover:text-[var(--color-neutral-100)] transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <span className="text-sm">Dark Mode</span>
            </button>
          </div>
        </div>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] mb-2">Automated Order & Logistics Management System</h1>
          <p className="text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)]">Professional logistics management for your business</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mb-1">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-md border border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-700)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-800)] text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] placeholder-[var(--color-neutral-500)] dark:placeholder-[var(--color-neutral-500)]"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-md border border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-700)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-800)] text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] placeholder-[var(--color-neutral-500)] dark:placeholder-[var(--color-neutral-500)]"
              />
            </div>
          </div>
          {error && (
            <div className="rounded-md bg-[var(--color-error)]/10 p-4 border border-[var(--color-error)]/20">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-[var(--color-error)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-[var(--color-error)]">{error}</h3>
                </div>
              </div>
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-colors duration-200 ${isLoading ? 'bg-[var(--color-primary)]/50 cursor-not-allowed' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90'} text-white`}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="mt-6 pt-6 border-t border-[var(--color-neutral-200)] dark:border-[var(--color-neutral-700)] text-center">
          <p className="text-sm text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">
            © {new Date().getFullYear()} AOLMS. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-[var(--color-neutral-400)] dark:text-[var(--color-neutral-500)]">
            Need help? <a href="mailto:support@aolms.com" className="text-[var(--color-primary)] hover:underline">Contact support</a>
          </p>
        </div>
      </div>

      {showNoRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-[var(--color-neutral-100)] dark:bg-[var(--color-neutral-800)] rounded-lg shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-[var(--color-warning)]/20 rounded-full mb-4">
              <svg className="w-6 h-6 text-[var(--color-warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-100)] text-center mb-2">Role Not Found</h3>
            <p className="text-[var(--color-neutral-600)] dark:text-[var(--color-neutral-400)] text-center mb-6">
              Login successful! However, your account does not have a valid role assigned (Admin, Controller, or Technician).
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowNoRoleModal(false)}
                className="w-full py-2.5 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-medium rounded-md transition-colors shadow-sm"
              >
                Understood
              </button>
              <a
                href="mailto:admin@aolms.com"
                className="w-full py-2.5 px-4 bg-transparent border border-[var(--color-neutral-300)] dark:border-[var(--color-neutral-600)] text-[var(--color-neutral-700)] dark:text-[var(--color-neutral-300)] hover:bg-[var(--color-neutral-100)] dark:hover:bg-[var(--color-neutral-700)] text-center font-medium rounded-md transition-colors"
              >
                Contact Administrator
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

console.log('Login component loaded');
export default Login;