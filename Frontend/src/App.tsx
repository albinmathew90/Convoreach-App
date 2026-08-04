import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import type { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Contacts from "./pages/Contacts";
import BroadcastsPage from "./pages/Broadcasts";
import ListTemplates from "./pages/Templates/ListTemplates";
import CreateTemplate from "./pages/Templates/CreateTemplate";
import Flows from "./pages/Flows";
import ActivityLog from "./pages/ActivityLog";
import Settings from "./pages/Settings";
import { InboxPage } from "./pages/Inbox";
import { UserProvider, useUser } from "./context/UserContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

// ---- Full-page loading spinner (inline styles so it always renders) ----
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', height: '100vh', width: '100%',
      alignItems: 'center', justifyContent: 'center',
      background: '#f9fafb', flexDirection: 'column', gap: '16px'
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '4px solid #e5e7eb',
        borderTopColor: '#465fff',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#9ca3af', fontSize: 14 }}>Loading...</p>
    </div>
  );
}

/**
 * ProtectedRoute — wraps authenticated pages.
 * - While the auth context is resolving (verifying the JWT with the server) → show spinner.
 * - If no valid user → redirect to /signin.
 * - Otherwise render the page normally.
 */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId="623118644403-0ri47l1fu15ndka8nppm09qf3puip9ta.apps.googleusercontent.com">
      <UserProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Protected Dashboard Layout — requires login */}
            <Route
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <AppLayout />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            >
              <Route index path="/" element={<Home />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/broadcasts" element={<BroadcastsPage />} />
              <Route path="/templates">
                <Route index element={<ListTemplates />} />
                <Route path="create" element={<CreateTemplate />} />
              </Route>
              <Route path="/flows" element={<Flows />} />
              <Route path="/activity-log" element={<ActivityLog />} />
              <Route path="/settings" element={<Navigate to="/settings/tags" replace />} />
              <Route path="/settings/tags" element={<Settings />} />
              <Route path="/settings/media" element={<Settings />} />
              <Route path="/settings/contact-fields" element={<Settings />} />
              <Route path="/profile" element={<UserProfiles />} />
            </Route>

            {/* Public Auth pages — redirect to dashboard if already logged in */}
            <Route
              path="/signin"
              element={
                <PublicRoute>
                  <SignIn />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}
