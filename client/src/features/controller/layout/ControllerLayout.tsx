import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../main';
import { Button } from '../../../components/Button';

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AOLMS Controller</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform md:relative md:translate-x-0 transition duration-200 ease-in-out">
          <nav>
            <Link
              to="/controller/dashboard"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
            >
              Dashboard
            </Link>
            <Link
              to="/controller/orders"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
            >
              Orders
            </Link>
            <Link
              to="/controller/assurance-tickets"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
            >
              Assurance Tickets
            </Link>
          </nav>
        </div>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ControllerLayout;