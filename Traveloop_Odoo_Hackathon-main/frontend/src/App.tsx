import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import BuildItinerary from './pages/BuildItinerary';
import TripListing from './pages/TripListing';
import UserProfile from './pages/UserProfile';
import ActivitySearch from './pages/ActivitySearch';
import ItineraryView from './pages/ItineraryView';
import Community from './pages/Community';
import PackingChecklist from './pages/PackingChecklist';
import AdminPanel from './pages/AdminPanel';
import TripNotes from './pages/TripNotes';
import ExpenseInvoice from './pages/ExpenseInvoice';
import CitySearch from './pages/CitySearch';
import SharedItinerary from './pages/SharedItinerary';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAdmin } = useStore((s) => s);
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth Routes */}
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
        <Route path="/forgot-password" element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />
        <Route path="/shared/:id?" element={<AnimatedPage><SharedItinerary /></AnimatedPage>} />

        {/* Main App Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PrivateRoute><AnimatedPage><Dashboard /></AnimatedPage></PrivateRoute>} />
          <Route path="/trips" element={<PrivateRoute><AnimatedPage><TripListing /></AnimatedPage></PrivateRoute>} />
          <Route path="/trips/new" element={<PrivateRoute><AnimatedPage><CreateTrip /></AnimatedPage></PrivateRoute>} />
          <Route path="/itinerary/build" element={<PrivateRoute><AnimatedPage><BuildItinerary /></AnimatedPage></PrivateRoute>} />
          <Route path="/itinerary/view" element={<PrivateRoute><AnimatedPage><ItineraryView /></AnimatedPage></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><AnimatedPage><UserProfile /></AnimatedPage></PrivateRoute>} />
          <Route path="/search-cities" element={<PrivateRoute><AnimatedPage><CitySearch /></AnimatedPage></PrivateRoute>} />
          <Route path="/search" element={<PrivateRoute><AnimatedPage><ActivitySearch /></AnimatedPage></PrivateRoute>} />
          <Route path="/community" element={<PrivateRoute><AnimatedPage><Community /></AnimatedPage></PrivateRoute>} />
          <Route path="/packing" element={<PrivateRoute><AnimatedPage><PackingChecklist /></AnimatedPage></PrivateRoute>} />
          <Route path="/notes" element={<PrivateRoute><AnimatedPage><TripNotes /></AnimatedPage></PrivateRoute>} />
          <Route path="/invoice" element={<PrivateRoute><AnimatedPage><ExpenseInvoice /></AnimatedPage></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AnimatedPage><AdminPanel /></AnimatedPage></AdminRoute>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
