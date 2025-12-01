import React, { lazy, Suspense, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSocket } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '../components/ProtectedRoute';

// --- Lazy-loaded Page Components ---
const HomePage = lazy(() => import('./home/HomePage.jsx'));
const Login = lazy(() => import('./auth/Login.jsx'));
const Register = lazy(() => import('./auth/Register.jsx'));
const ForgotPassword = lazy(() => import('./auth/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./auth/ResetPassword.jsx'));
const DashboardPage = lazy(() => import('./dashboard/DashboardPage.jsx'));
const TeacherDashboardPage = lazy(() => import('./dashboard/TeacherDashboardPage.jsx'));
const ProfilePage = lazy(() => import('./profile/ProfilePage.jsx'));
const EditProfile = lazy(() => import('./profile/EditProfile.jsx'));
const PublicProfilePage = lazy(() => import('./profile/PublicProfilePage.jsx'));
const FindMatchesPage = lazy(() => import('./exchange/FindMatchesPage.jsx'));
const ExchangeDetailsPage = lazy(() => import('./exchange/ExchangeDetailsPage.jsx'));
const RecordingDetailsPage = lazy(() => import('./exchange/RecordingDetailsPage.jsx'));
const ProjectsListPage = lazy(() => import('./projects/ProjectsListPage.jsx'));
const ProjectWorkspacePage = lazy(() => import('./projects/ProjectWorkspacePage.jsx'));
const SkillTreesListPage = lazy(() => import('./skilltrees/SkillTreesListPage.jsx'));
const SkillTreePage = lazy(() => import('./skilltrees/SkillTreePage.jsx'));
const LeaderboardPage = lazy(() => import('./leaderboard/LeaderboardPage.jsx'));
const ForumsListPage = lazy(() => import('./forums/ForumsListPage.jsx'));
const ForumDetailsPage = lazy(() => import('./forums/ForumDetailsPage.jsx'));
const PostDetailsPage = lazy(() => import('./forums/PostDetailsPage.jsx'));
const MentorsListPage = lazy(() => import('./mentors/MentorsListPage.jsx'));
const PremiumContentPage = lazy(() => import('./mentors/PremiumContentPage.jsx'));
const PaymentStatusPage = lazy(() => import('./mentors/PaymentStatusPage.jsx'));
const AssessmentPage = lazy(() => import('./assessment/AssessmentPage.jsx'));
const ResourceListPage = lazy(() => import('./resources/ResourceListPage.jsx'));
const ResourceDetailsPage = lazy(() => import('./resources/ResourceDetailsPage.jsx'));
const CreateResourcePage = lazy(() => import('./resources/CreateResourcePage.jsx'));
const EventsListPage = lazy(() => import('./events/EventsListPage.jsx'));
const EventDetailsPage = lazy(() => import('./events/EventDetailsPage.jsx'));
const CreateEventPage = lazy(() => import('./events/CreateEventPage.jsx'));
const FeatureRequestsPage = lazy(() => import('./feature-requests/FeatureRequestsPage.jsx'));
const OnboardingPage = lazy(() => import('./onboarding/OnboardingPage.jsx'));
const CreateDisputePage = lazy(() => import('./disputes/CreateDisputePage.jsx'));
const DisputeDetailsPage = lazy(() => import('./disputes/DisputeDetailsPage.jsx'));
const SupportDashboardPage = lazy(() => import('./support/SupportDashboardPage.jsx'));
const AdminDashboardPage = lazy(() => import('./admin/AdminDashboardPage.jsx'));

// --- Loading Fallback Component ---
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full py-20">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const socket = useSocket();
  const { t } = useTranslation();
  const { refetchUser } = useContext(AuthContext);

  useEffect(() => {
    // Register service worker for push notifications
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('Service Worker registered with scope:', registration.scope))
        .catch(error => console.error('Service Worker registration failed:', error));
    }
  }, []);

  useEffect(() => {
    if (!socket || !refetchUser) return;
    const handleAchievement = (achievement) => {
        toast.success(
            () => (
                <div className="flex items-center">
                    <span className="text-3xl mr-3">{achievement.icon || '🏆'}</span>
                    <div>
                        <p className="font-bold">Achievement Unlocked!</p>
                        <p>{achievement.name} (+{achievement.points} pts)</p>
                    </div>
                </div>
            ),
            { duration: 6000, position: 'bottom-right' }
        );
        refetchUser(); // Bug Fix: Refetch user to update points in UI
    };

    const handleTranscriptReady = ({ recordingId, title }) => {
        toast.success(
             () => (
                <div>
                    <p className="font-bold">Transcript Ready!</p>
                    <p>Your recording "{title}" has been transcribed.</p>
                </div>
            ),
            { icon: '📝', duration: 6000 }
        );
    };

    const handleSkillVerified = ({ topicName }) => {
        toast.success(
            () => (
                <div className="flex items-center">
                    <span className="text-3xl mr-3">🛡️</span>
                    <div>
                        <p className="font-bold">{t('notifications.skillVerifiedTitle')}</p>
                        <p>{t('notifications.skillVerifiedBody', { topicName })}</p>
                    </div>
                </div>
            ),
            { duration: 8000 }
        );
    };

    const handleReviewSummaryUpdated = () => {
        toast.success("Your AI review summary has been updated!", { icon: '🤖' });
        refetchUser();
    };


    socket.on('achievementUnlocked', handleAchievement);
    socket.on('transcriptReady', handleTranscriptReady);
    socket.on('skillVerified', handleSkillVerified);
    socket.on('reviewSummaryUpdated', handleReviewSummaryUpdated);


    return () => {
        socket.off('achievementUnlocked', handleAchievement);
        socket.off('transcriptReady', handleTranscriptReady);
        socket.off('skillVerified', handleSkillVerified);
        socket.off('reviewSummaryUpdated', handleReviewSummaryUpdated);
    };
  }, [socket, t, refetchUser]);


  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/users/:slug" element={<PublicProfilePage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><DashboardPage /></ProtectedRoute>} />
            <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><TeacherDashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><ProfilePage /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><EditProfile /></ProtectedRoute>} />
            <Route path="/exchange/find" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><FindMatchesPage /></ProtectedRoute>} />
            <Route path="/exchange/:id" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><ExchangeDetailsPage /></ProtectedRoute>} />
            <Route path="/recordings/:id" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><RecordingDetailsPage /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><ProjectsListPage /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><ProjectWorkspacePage /></ProtectedRoute>} />
            <Route path="/skill-trees" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><SkillTreesListPage /></ProtectedRoute>} />
            <Route path="/skill-trees/:id" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><SkillTreePage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/forums" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><ForumsListPage /></ProtectedRoute>} />
            <Route path="/forums/:id" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><ForumDetailsPage /></ProtectedRoute>} />
            <Route path="/posts/:id" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><PostDetailsPage /></ProtectedRoute>} />
            <Route path="/mentors" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><MentorsListPage /></ProtectedRoute>} />
            <Route path="/premium-content" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><PremiumContentPage /></ProtectedRoute>} />
            <Route path="/payment-success" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><PaymentStatusPage status="success" /></ProtectedRoute>} />
            <Route path="/payment-cancelled" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><PaymentStatusPage status="cancelled" /></ProtectedRoute>} />
            <Route path="/assessment/:topicId" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><AssessmentPage /></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><ResourceListPage /></ProtectedRoute>} />
            <Route path="/resources/new" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><CreateResourcePage /></ProtectedRoute>} />
            <Route path="/resources/:id" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><ResourceDetailsPage /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><EventsListPage /></ProtectedRoute>} />
            <Route path="/events/new" element={<ProtectedRoute allowedRoles={['mentor', 'admin']}><CreateEventPage /></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><EventDetailsPage /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><FeatureRequestsPage /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><OnboardingPage /></ProtectedRoute>} />
            <Route path="/dispute/new/:exchangeId" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><CreateDisputePage /></ProtectedRoute>} />
            <Route path="/disputes/:id" element={<ProtectedRoute allowedRoles={['user', 'mentor', 'support', 'admin']}><DisputeDetailsPage /></ProtectedRoute>} />
            
            {/* Role-Specific Routes */}
            <Route path="/support/dashboard" element={
                <ProtectedRoute allowedRoles={['support', 'admin']}>
                    <SupportDashboardPage />
                </ProtectedRoute>
            } />
             <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;