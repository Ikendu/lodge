import React from "react";
// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/AboutUs.jsx";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterSuccess from "./pages/RegisterSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import Apartments from "./pages/Apartments.jsx";
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

// (links array removed; not used in this file)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/registeruser" element={<RegisterCustomer />} />
          <Route
            path="/registeruser/details"
            element={<RegisterCustomerDetails />}
          />

          <Route path="/register-success" element={<RegisterSuccess />} />
          <Route path="/lodge/:id" element={<LodgeDetails />} />

          {/* <Route
            path="/lodge/:id"
            element={
              <ProtectedRoute>
                <LodgeDetails />
              </ProtectedRoute>
            }
          /> */}
          <Route path="/apartments" element={<Apartments />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/faqs" element={<FAQPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/safety" element={<SafetyTips />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
