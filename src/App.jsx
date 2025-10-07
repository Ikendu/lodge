import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
import { Menu, X, Facebook, Twitter, Instagram } from "lucide-react";
// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/AboutUs.jsx";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterOwner from "./pages/RegisterOwner";
import Apartments from "./pages/Apartments.jsx";
import LoginPage from "./pages/Login.jsx";
import FAQPage from "./pages/FqaPage.jsx";
import LodgeDetails from "./pages/LodgeDetails.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import HelpCenter from "./pages/HelpCenter.jsx";
import SafetyTips from "./pages/SaftyTips.jsx";

const links = [
  { id: "hero", label: "Home", path: "/" },
  { id: "features", label: "Features", path: "/features" },
  { id: "pricing", label: "Pricing", path: "/pricing" },
  { id: "testimonials", label: "Testimonials", path: "/testimonials" },
  { id: "contact", label: "Contact", path: "/contact" },
];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/registeruser" element={<RegisterCustomer />} />
          <Route path="/registerowner" element={<RegisterOwner />} />
          <Route path="/lodge/:id" element={<LodgeDetails />} />
          <Route path="/apartments" element={<Apartments />} />
          <Route path="/login" element={<LoginPage />} />
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
