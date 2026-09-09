import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './app/theme/theme-context';
import { useEffect } from 'react';

// Pages
import Login from './auth/pages/Login';
import AdminLayout from './features/admin/layout/AdminLayout';
import ControllerLayout from './features/controller/layout/ControllerLayout';
import TechnicianLayout from './features/technician/layout/TechnicianLayout';
import { ProtectedRoute } from './auth/components/ProtectedRoute';

function App() {
  // Check auth status on app load
  useEffect(() => {
    // This is a placeholder. We'll implement auth properly later.
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            element={<ProtectedRoute><Outlet /></ProtectedRoute>}
          >
            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route path="dashboard" element={<div>Admin Dashboard</div>} />
              <Route path="profiles" element={<div>Profiles Management</div>} />
              <Route path="projects" element={<div>Projects Management</div>} />
            </Route>

            {/* Controller routes */}
            <Route path="/controller/*" element={<ControllerLayout />}>
              <Route path="dashboard" element={<div>Controller Dashboard</div>} />
              <Route path="orders" element={<div>Orders Spreadsheet</div>} />
              <Route path="assurance-tickets" element={<div>Assurance Tickets</div>} />
            </Route>

            {/* Technician routes */}
            <Route path="/technician/*" element={<TechnicianLayout />}>
              <Route path="dashboard" element={<div>Technician Dashboard</div>} />
              <Route path="todo" element={<div>To-Do Tasks</div>} />
              <Route path="history" element={<div>Completed Tasks</div>} />
              <Route path="delivery-form/:orderId" element={<div>Delivery Form</div>} />
              <Route path="assurance-form/:ticketId" element={<div>Assurance Form</div>} />
            </Route>

            {/* Redirect to login if no role matched (should be handled by ProtectedRoute) */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;