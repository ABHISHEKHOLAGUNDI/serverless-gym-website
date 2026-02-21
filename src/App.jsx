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
import PortalLayout from './components/PortalLayout';
import PortalDashboard from './pages/portal/PortalDashboard';
import MyProfile from './pages/portal/MyProfile';
import MyAttendance from './pages/portal/MyAttendance';
import MyWorkout from './pages/portal/MyWorkout';
import MyDiet from './pages/portal/MyDiet';
import MyPayments from './pages/portal/MyPayments';
import Chat from './pages/portal/Chat';
import { AnimatePresence } from 'framer-motion';

import { GymProvider } from './context/GymContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Admin-only route guard
const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/portal" replace />;
  return <Outlet />;
};

// Member-only route guard
const MemberRoute = () => {
  const { isAuthenticated, isMember, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isMember) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <GymProvider>
        <Router>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
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

              {/* Member Portal Routes */}
              <Route element={<MemberRoute />}>
                <Route element={<PortalLayout />}>
                  <Route path="/portal" element={<PortalDashboard />} />
                  <Route path="/portal/profile" element={<MyProfile />} />
                  <Route path="/portal/attendance" element={<MyAttendance />} />
                  <Route path="/portal/workouts" element={<MyWorkout />} />
                  <Route path="/portal/diet" element={<MyDiet />} />
                  <Route path="/portal/payments" element={<MyPayments />} />
                  <Route path="/portal/chat" element={<Chat />} />
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
