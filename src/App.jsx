import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  // Mock Auth State - detailed auth logic to be implemented
  const isAuthenticated = true;

  return (
    <GymProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<Layout />}>
              <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/members" element={<Members />} />
              <Route path="/trainers" element={<Trainers />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/measurements" element={<Measurements />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Router>
    </GymProvider>
  );
}

export default App;
