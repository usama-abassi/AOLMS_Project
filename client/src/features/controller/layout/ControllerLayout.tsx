import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from '../../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../main';
import { LayoutDashboard, ClipboardList, TicketCheck, Settings } from 'lucide-react';

const ControllerLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!supabase) {
      navigate('/login');
      return;
    }
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/controller/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Orders', path: '/controller/orders', icon: <ClipboardList className="w-5 h-5" /> },
    { label: 'Assurance', path: '/controller/assurance-tickets', icon: <TicketCheck className="w-5 h-5" /> },
    { label: 'Settings', path: '/controller/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <Layout navItems={navItems} onLogout={handleLogout}>
      <Outlet />
    </Layout>
  );
};

export default ControllerLayout;