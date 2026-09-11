import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

import Home from '@/pages/Home';
import SeasonDetail from '@/pages/SeasonDetail';
import TrekDetail from '@/pages/TrekDetail';
import GuideDashboard from '@/pages/GuideDashboard';
import AdminPanel from '@/pages/AdminPanel';
import Bookings from '@/pages/Bookings';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/season/:season" element={<SeasonDetail />} />
          <Route path="/trek/:id" element={<TrekDetail />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/guide" element={<GuideDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
