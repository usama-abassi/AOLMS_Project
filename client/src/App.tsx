import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './app/theme/theme-context';
import Login from './auth/pages/Login';
import AdminLayout from './features/admin/layout/AdminLayout';
import ControllerLayout from './features/controller/layout/ControllerLayout';
import TechnicianLayout from './features/technician/layout/TechnicianLayout';
import { ProtectedRoute } from './auth/components/ProtectedRoute';
import AdminDashboard from './features/admin/pages/Dashboard';
import Profiles from './features/admin/pages/Profiles';
import Projects from './features/admin/pages/Projects';
import Profile from './features/admin/pages/Profile';
import ControllerSpreadsheet from './features/controller/components/Spreadsheet';
import TechnicianDeliveryForm from './features/technician/components/DeliveryForm';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            element={<ProtectedRoute><Outlet /></ProtectedRoute>}
          >
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profiles" element={<Profiles />} />
              <Route path="projects" element={<Projects />} />
              <Route path="profile/me" element={<Profile />} />
            </Route>

            <Route path="/controller/*" element={<ControllerLayout />}>
              <Route path="orders" element={<ControllerSpreadsheet />} />
            </Route>

            <Route path="/technician/*" element={<TechnicianLayout />}>
              <Route path="delivery-form/:orderId" element={<TechnicianDeliveryForm />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;