import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { CommunityProvider } from './context/CommunityContext';
import { ChatProvider } from './context/ChatContext';
import { NotificationsProvider } from './context/NotificationsContext';
import MessagesView from './components/chat/MessagesView';
import FloatingNavRail from './components/FloatingNavRail';
import TopBar from './components/TopBar';

// Modals
import VideoReelModal from './components/modals/VideoReelModal';
import LoginModal from './components/modals/LoginModal';
import RoleSelectModal from './components/modals/RoleSelectModal';
import SubmitClipModal from './components/modals/SubmitClipModal';
import ApplyCampaignModal from './components/modals/ApplyCampaignModal';
import ConnectAccountModal from './components/modals/ConnectAccountModal';
import UploadDraftModal from './components/modals/UploadDraftModal';
import WithdrawModal from './components/modals/WithdrawModal';
import FundCampaignModal from './components/modals/FundCampaignModal';
import RejectReasonModal from './components/modals/RejectReasonModal';
import AppealModal from './components/modals/AppealModal';

// Creator Views
import DiscoverView from './views/creator/DiscoverView';
import CampaignsForYouView from './views/creator/CampaignsForYouView';
import CampaignDetailView from './views/creator/CampaignDetailView';
import HomeView from './views/creator/HomeView';
import CampaignsListView from './views/creator/CampaignsListView';
import SubmissionsView from './views/creator/SubmissionsView';
import DraftsView from './views/creator/DraftsView';
import AnalyticsView from './views/creator/AnalyticsView';
import EarningsView from './views/creator/EarningsView';
import SettingsView from './views/creator/SettingsView';
import CreatorOnboardingView from './views/creator/CreatorOnboardingView';
import BrandProfileView from './views/creator/BrandProfileView';

// Brand Views
import BrandDashboardView from './views/brand/BrandDashboardView';
import BrandCampaignsView from './views/brand/BrandCampaignsView';
import CreateCampaignView from './views/brand/CreateCampaignView';
import CampaignManageView from './views/brand/CampaignManageView';
import BrandAnalyticsView from './views/brand/BrandAnalyticsView';
import BrandPayoutsView from './views/brand/BrandPayoutsView';
import BrandApplicationsView from './views/brand/BrandApplicationsView';
import BrandCreatorsView from './views/brand/BrandCreatorsView';
import BrandBalanceView from './views/brand/BrandBalanceView';
import BrandSettingsView from './views/brand/BrandSettingsView';
import BrandOnboardingView from './views/brand/BrandOnboardingView';
import BrandPageView from './views/brand/BrandPageView';

const MainLayout: React.FC = () => {
  const { role, creatorView, brandView, toastMessage } = useApp();

  const renderActiveScreen = () => {
    if (role === 'creator') {
      switch (creatorView) {
        case 'discover':
          return <DiscoverView />;
        case 'campaigns-for-you':
          return <CampaignsForYouView />;
        case 'campaign-detail':
          return <CampaignDetailView />;
                  case 'brand-profile':
          return <BrandProfileView />;
                  case 'messages':
          return <MessagesView />;
        case 'home':
          return <HomeView />;
        case 'campaigns':
          return <CampaignsListView />;
        case 'submissions':
          return <SubmissionsView />;
        case 'drafts':
          return <DraftsView />;
        case 'analytics':
          return <AnalyticsView />;
        case 'earnings':
          return <EarningsView />;
        case 'settings':
          return <SettingsView />;
        default:
          return <DiscoverView />;
      }
    } else {
      switch (brandView) {
        case 'dashboard':
          return <BrandDashboardView />;
        case 'campaigns':
          return <BrandCampaignsView />;
        case 'create-campaign':
          return <CreateCampaignView />;
        case 'campaign-manage':
          return <CampaignManageView />;
        case 'analytics':
          return <BrandAnalyticsView />;
        case 'payouts':
          return <BrandPayoutsView />;
        case 'applications':
          return <BrandApplicationsView />;
        case 'creators':
          return <BrandCreatorsView />;
        case 'balance':
          return <BrandBalanceView />;
                  case 'brand-page':
          return <BrandPageView />;
                  case 'messages':
          return <MessagesView />;
        case 'settings':
          return <BrandSettingsView />;
        default:
          return <BrandDashboardView />;
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0A0A0A] text-white flex flex-col overflow-x-hidden" dir="rtl">
      {/* Subtle Film Grain Overlay */}
      <div className="fixed inset-0 film-grain z-50 pointer-events-none" />

      {/* Background Radial Glow Spotlights */}
      <div className="fixed -top-40 right-1/4 w-[600px] h-[600px] bg-white/[0.035] rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/2 left-10 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[130px] pointer-events-none" />

      {/* FLOATING VERTICAL GLASS RAIL (72px wide, detached with 16px margin, expanding on hover to 220px) */}
      <FloatingNavRail />

      {/* MAIN VIEWPORT (Expansive full-width content area with right margin for floating rail) */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#0A0A0A] relative z-10 md:pr-[88px] pb-24 md:pb-8 transition-all duration-300">
        <TopBar />
        <div className="flex-1 w-full max-w-[1600px] mx-auto">
          {renderActiveScreen()}
        </div>
      </main>

      {/* Global Modals */}
      <VideoReelModal />
      <LoginModal />
      <RoleSelectModal />
      <SubmitClipModal />
      <ApplyCampaignModal />
      <ConnectAccountModal />
      <UploadDraftModal />
      <WithdrawModal />
      <FundCampaignModal />
      <RejectReasonModal />
      <AppealModal />
      <CreatorOnboardingView />
      <BrandOnboardingView />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="py-2.5 px-6 rounded-full bg-white text-black font-semibold text-xs shadow-[0_0_24px_rgba(255,255,255,0.6)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black animate-ping" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <NotificationsProvider>
        <CommunityProvider>
          <ChatProvider>
            <MainLayout />
          </ChatProvider>
        </CommunityProvider>
      </NotificationsProvider>
     </AppProvider>
  );
}
