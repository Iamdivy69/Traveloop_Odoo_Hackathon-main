import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import PageLoader from './components/ui/PageLoader';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { Toaster } from './components/ui/sonner';

// Lazy loaded page components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateTrip = lazy(() => import('./pages/CreateTrip'));
const BuildItinerary = lazy(() => import('./pages/BuildItinerary'));
const TripListing = lazy(() => import('./pages/TripListing'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const ActivitySearch = lazy(() => import('./pages/ActivitySearch'));
const ItineraryView = lazy(() => import('./pages/ItineraryView'));
const Community = lazy(() => import('./pages/Community'));
const PackingChecklist = lazy(() => import('./pages/PackingChecklist'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const TripNotes = lazy(() => import('./pages/TripNotes'));
const ExpenseInvoice = lazy(() => import('./pages/ExpenseInvoice'));
const CitySearch = lazy(() => import('./pages/CitySearch'));
const SharedItinerary = lazy(() => import('./pages/SharedItinerary'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  return (user || token) ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  if (!user && !token) return <Navigate to="/login" replace />;
  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;
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
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
      <Toaster />
      <Suspense fallback={<PageLoader />}>
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
              <Route path="/itinerary/build/:tripId" element={<PrivateRoute><AnimatedPage><BuildItinerary /></AnimatedPage></PrivateRoute>} />
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
      </Suspense>
    </ErrorBoundary>
  );
}
