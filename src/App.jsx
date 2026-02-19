import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Attendance from './pages/Attendance';
import Expenses from './pages/Expenses';
import Measurements from './pages/Measurements';
import Reports from './pages/Reports';
import Trainers from './pages/Trainers';
import Maintenance from './pages/Maintenance';
import Layout from './components/Layout';
import { AnimatePresence } from 'framer-motion';

import { GymProvider } from './context/GymContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <GymProvider>
        <Router>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/trainers" element={<Trainers />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/measurements" element={<Measurements />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/reports" element={<Reports />} />
                </Route>
              </Route>

            </Routes>
          </AnimatePresence>
        </Router>
      </GymProvider>
    </AuthProvider>
  );
}

export default App;
