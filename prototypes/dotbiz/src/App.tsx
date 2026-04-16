import { HashRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import ScrollToTop from "@/components/ScrollToTop";
import MainLayout from "@/pages/MainLayout";
import LoginPage from "@/pages/LoginPage";
import RegistrationPage from "@/pages/RegistrationPage";
import DashboardPage from "@/pages/DashboardPage";
import FindHotelPage from "@/pages/FindHotelPage";
import SearchResultsPage from "@/pages/SearchResultsPage";
import HotelDetailPage from "@/pages/HotelDetailPage";
import BookingFormPage from "@/pages/BookingFormPage";
import BookingConfirmPage from "@/pages/BookingConfirmPage";
import BookingCompletePage from "@/pages/BookingCompletePage";
import BookingsPage from "@/pages/BookingsPage";
import SettlementPage from "@/pages/SettlementPage";
import NotificationsPage from "@/pages/NotificationsPage";
import FaqBoardPage from "@/pages/FaqBoardPage";
import MyAccountPage from "@/pages/MyAccountPage";
import RewardsMallPage from "@/pages/RewardsMallPage";
import CampaignPage from "@/pages/CampaignPage";
import OhMyBlogPage from "@/pages/OhMyBlogPage";
import ContactUsPage from "@/pages/ContactUsPage";
import ClientManagementPage from "@/pages/ClientManagementPage";
import TicketManagementPage from "@/pages/TicketManagementPage";
import MapSearchPage from "@/pages/MapSearchPage";
import HotelMapViewPage from "@/pages/HotelMapViewPage";
import MarkupSharingPage from "@/pages/MarkupSharingPage";
import FavoritesPage from "@/pages/FavoritesPage";
import MonthlyRatePage from "@/pages/MonthlyRatePage";

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          {/* Layout route */}
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="find-hotel" element={<FindHotelPage />} />
            <Route path="search-results" element={<SearchResultsPage />} />
            <Route path="hotel/:hotelId" element={<HotelDetailPage />} />
            <Route path="booking/form" element={<BookingFormPage />} />
            <Route path="booking/confirm" element={<BookingConfirmPage />} />
            <Route path="booking/complete" element={<BookingCompletePage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="bookings/:bookingId" element={<BookingsPage />} />
            <Route path="settlement" element={<SettlementPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="faq" element={<FaqBoardPage />} />
            <Route path="my-account" element={<MyAccountPage />} />
            <Route path="rewards" element={<RewardsMallPage />} />
            <Route path="campaign/:campaignId" element={<CampaignPage />} />
            <Route path="blog" element={<OhMyBlogPage />} />
            <Route path="blog/:articleId" element={<OhMyBlogPage />} />
            <Route path="contact" element={<ContactUsPage />} />
            <Route path="client" element={<ClientManagementPage />} />
            <Route path="tickets" element={<TicketManagementPage />} />
            <Route path="map-search" element={<MapSearchPage />} />
            <Route path="hotel-map" element={<HotelMapViewPage />} />
            <Route path="markup-sharing" element={<MarkupSharingPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="monthly-rates" element={<MonthlyRatePage />} />
          </Route>
          {/* Standalone screens */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
