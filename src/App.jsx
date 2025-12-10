import React from "react";
// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";
import ModalProvider from "./components/ui/ModalProvider";
import Home from "./pages/Home";
import About from "./pages/AboutUs.jsx";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterSuccess from "./pages/RegisterSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import Apartments from "./pages/Apartments.jsx";
import HotelGuestHouse from "./pages/HotelGuestHouse.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import LoginPage from "./pages/Login.jsx";
import FAQPage from "./pages/FqaPage.jsx";
import LodgeDetails from "./pages/LodgeDetails.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import HelpCenter from "./pages/HelpCenter.jsx";
import SafetyTips from "./pages/SaftyTips.jsx";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import RegisterCustomerDetails from "./pages/RegisterCustomerDetails";
import RegisterNextOfKin from "./pages/RegisterNextOfKin";
import AddNewLodge from "./pages/AddNewLodge.jsx";
import AdminLayout from "./components/admin/AdminLayout";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import Users from "./pages/admin/Users";
import Lodges from "./pages/admin/Lodges";
import Payments from "./pages/admin/Payments";
import RefundRequests from "./pages/admin/RefundRequests";
import HowItWorks from "./pages/HowItWorks";
import AccountDeletions from "./pages/admin/AccountDeletions";
import Complaints from "./pages/admin/Complaints";
import Contacts from "./pages/admin/Contacts";
import Dashboard from "./pages/admin/Dashboard";
import ItemDetail from "./pages/admin/ItemDetail";
import DojahNINTest from "./pages/TestDoja.jsx";
import Test from "./pages/Test.jsx";

// (links array removed; not used in this file)

export default function App() {
  return (
    <BrowserRouter>
      <ModalProvider>
        <ScrollToTop />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/registeruser" element={<RegisterCustomerDetails />} />
            <Route
              path="/registeruser/next-of-kin"
              element={<RegisterNextOfKin />}
            />
            <Route
              path="/registeruser/details"
              element={<RegisterCustomer />}
            />

            <Route path="/register-success" element={<RegisterSuccess />} />
            <Route path="/lodge/:id" element={<LodgeDetails />} />
            <Route path="/lodge/" element={<LodgeDetails />} />

            <Route path="/apartments" element={<Apartments />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/hotel-guesthouse" element={<HotelGuestHouse />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/list_new_lodge" element={<AddNewLodge />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/faqs" element={<FAQPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/safety" element={<SafetyTips />} />
            <Route path="/testdoja" element={<DojahNINTest />} />
            <Route path="/test" element={<Test />} />
          </Route>

          {/* admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="lodges" element={<Lodges />} />
            <Route path="payments" element={<Payments />} />
            <Route path="refunds" element={<RefundRequests />} />
            <Route path="account-deletions" element={<AccountDeletions />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="contacts" element={<Contacts />} />
            {/* Generic detail view for admin resources (uses location.state when available) */}
            <Route path=":resource/:id" element={<ItemDetail />} />
          </Route>
        </Routes>
      </ModalProvider>
    </BrowserRouter>
  );
}
