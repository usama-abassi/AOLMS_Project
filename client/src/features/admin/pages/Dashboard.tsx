import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../main';
import { Card } from '../../../components/Card';

interface DashboardStats {
  totalUsers: number;
  activeControllers: number;
  activeTechnicians: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase client not initialized');

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: activeControllers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'controller');

      const { count: activeTechnicians } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'technician');

      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'Pending');

      const { count: completedOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'Delivered');

      return {
        totalUsers,
        activeControllers,
        activeTechnicians,
        totalOrders,
        pendingOrders,
        completedOrders,
      };
    },
  });

  const { data: recentActivity, isLoading: isActivityLoading } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      if (!supabase) throw new Error('Supabase client not initialized');

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const isLoading = isStatsLoading || isActivityLoading;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Total Users" subtitle="All registered users">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">
              {isLoading ? '...' : stats?.totalUsers}
            </span>
            <div className="w-24 h-2 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-primary)]" style={{ width: `${isLoading ? 0 : (stats?.totalUsers || 0) * 100 / 100}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Active Controllers" subtitle="Order managers">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">
              {isLoading ? '...' : stats?.activeControllers}
            </span>
            <div className="w-24 h-2 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-primary)]" style={{ width: `${isLoading ? 0 : (stats?.activeControllers || 0) * 100 / 100}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Active Technicians" subtitle="Field technicians">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">
              {isLoading ? '...' : stats?.activeTechnicians}
            </span>
            <div className="w-24 h-2 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-primary)]" style={{ width: `${isLoading ? 0 : (stats?.activeTechnicians || 0) * 100 / 100}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Total Orders" subtitle="All orders processed">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">
              {isLoading ? '...' : stats?.totalOrders}
            </span>
            <div className="w-24 h-2 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-primary)]" style={{ width: `${isLoading ? 0 : (stats?.totalOrders || 0) * 100 / 100}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Pending Orders" subtitle="Orders awaiting processing">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">
              {isLoading ? '...' : stats?.pendingOrders}
            </span>
            <div className="w-24 h-2 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-warning)]" style={{ width: `${isLoading ? 0 : (stats?.pendingOrders || 0) * 100 / 100}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Completed Orders" subtitle="Successfully delivered orders">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">
              {isLoading ? '...' : stats?.completedOrders}
            </span>
            <div className="w-24 h-2 bg-[var(--color-neutral-200)] dark:bg-[var(--color-neutral-700)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-success)]" style={{ width: `${isLoading ? 0 : (stats?.completedOrders || 0) * 100 / 100}%` }} />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">Recent Activity</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-neutral-200)] dark:divide-[var(--color-neutral-700)]">
              <thead className="bg-[var(--color-neutral-50)] dark:bg-[var(--color-neutral-800)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)] uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)] uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)] uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[var(--color-neutral-900)] divide-y divide-[var(--color-neutral-200)] dark:divide-[var(--color-neutral-700)]">
                {isActivityLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-center text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">Loading...</td>
                  </tr>
                ) : (
                  recentActivity?.length ? (
                    recentActivity.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">
                          {activity.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">
                          {activity.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[var(--color-neutral-900)] dark:text-[var(--color-neutral-50)]">
                          {new Date(activity.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-center text-[var(--color-neutral-500)] dark:text-[var(--color-neutral-400)]">No recent activity</td>
                    </tr>
                  )
                  )
                }
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;