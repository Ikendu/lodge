import React, { useRef, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
import { Menu, X, Facebook, Twitter, Instagram } from "lucide-react";

// Sticky Navbar with Active Section Highlighting + Mobile Menu
const Navbar = ({ scrollToSection, activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { id: "hero", label: "Home", path: "/" },
    { id: "features", label: "Features", path: "/features" },
    { id: "pricing", label: "Pricing", path: "/pricing" },
    { id: "testimonials", label: "Testimonials", path: "/testimonials" },
    { id: "contact", label: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">MyApp</h1>

        {/* Desktop Menu */}
        <div className="space-x-6 hidden md:flex">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`${
                activeSection === link.id
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white px-6 pb-4 space-y-4">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                scrollToSection(link.id);
                setIsOpen(false);
              }}
              className={`block w-full text-left ${
                activeSection === link.id
                  ? "text-blue-600 font-semibold"
                  : "text-gray-600"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

// Sections
const Hero = React.forwardRef((props, ref) => (
  <section
    ref={ref}
    id="hero"
    className="h-screen flex flex-col justify-center items-center text-center px-6"
  >
    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-4xl md:text-6xl font-bold"
    >
      Welcome to MyApp
    </motion.h2>
    <p className="mt-4 text-lg text-gray-600 max-w-xl">
      A platform to connect travelers and hosts, plus house rentals.
    </p>
    <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
      Get Started
    </button>
    {/* <Button className="mt-6">Get Started</Button> */}
  </section>
));

const Features = React.forwardRef((props, ref) => (
  <section ref={ref} id="features" className="py-20 px-6 bg-gray-50">
    <h2 className="text-3xl font-bold text-center">Features</h2>
    <p className="text-center text-gray-600 mt-2">What makes our app special</p>
  </section>
));

const Pricing = React.forwardRef((props, ref) => (
  <section ref={ref} id="pricing" className="py-20 px-6">
    <h2 className="text-3xl font-bold text-center">Pricing</h2>
    <p className="text-center text-gray-600 mt-2">
      Flexible options for everyone
    </p>
  </section>
));

const Testimonials = React.forwardRef((props, ref) => (
  <section ref={ref} id="testimonials" className="py-20 px-6 bg-gray-50">
    <h2 className="text-3xl font-bold text-center">Testimonials</h2>
    <p className="text-center text-gray-600 mt-2">See what our users say</p>
  </section>
));

const Contact = React.forwardRef((props, ref) => (
  <section ref={ref} id="contact" className="py-20 px-6">
    <h2 className="text-3xl font-bold text-center">Contact Us</h2>
    <p className="text-center text-gray-600 mt-2">We'd love to hear from you</p>
  </section>
));

// Footer
const Footer = () => (
  <footer className="bg-gray-900 text-white py-10 mt-10">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="text-xl font-bold">MyApp</h3>
        <p className="mt-2 text-gray-400">
          Connecting travelers and hosts worldwide.
        </p>
      </div>

      <div>
        <h4 className="font-semibold">Quick Links</h4>
        <ul className="mt-2 space-y-2 text-gray-400">
          <li>
            <a href="#hero" className="hover:text-white">
              Home
            </a>
          </li>
          <li>
            <a href="#features" className="hover:text-white">
              Features
            </a>
          </li>
          <li>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
          </li>
          <li>
            <a href="#testimonials" className="hover:text-white">
              Testimonials
            </a>
          </li>
          <li>
            <a href="#contact" className="hover:text-white">
              Contact
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold">Follow Us</h4>
        <div className="flex space-x-4 mt-2">
          <a href="#" className="hover:text-blue-500">
            <Facebook size={20} />
          </a>
          <a href="#" className="hover:text-blue-400">
            <Twitter size={20} />
          </a>
          <a href="#" className="hover:text-pink-500">
            <Instagram size={20} />
          </a>
        </div>
      </div>
    </div>
    <div className="mt-8 text-center text-gray-500 text-sm">
      © {new Date().getFullYear()} MyApp. All rights reserved.
    </div>
  </footer>
);

// Home page with scroll refs
const Home = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const testimonialsRef = useRef(null);
  const contactRef = useRef(null);
  const [activeSection, setActiveSection] = useState("hero");

  const sectionRefs = {
    hero: heroRef,
    features: featuresRef,
    pricing: pricingRef,
    testimonials: testimonialsRef,
    contact: contactRef,
  };

  const scrollToSection = (id) => {
    sectionRefs[id]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY + window.innerHeight / 3;
      for (const key in sectionRefs) {
        const ref = sectionRefs[key].current;
        if (ref) {
          const { offsetTop, offsetHeight } = ref;
          if (offset >= offsetTop && offset < offsetTop + offsetHeight) {
            setActiveSection(key);
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Navbar scrollToSection={scrollToSection} activeSection={activeSection} />
      <div className="pt-20">
        <Hero ref={heroRef} />
        <Features ref={featuresRef} />
        <Pricing ref={pricingRef} />
        <Testimonials ref={testimonialsRef} />
        <Contact ref={contactRef} />
        <Footer />
      </div>
    </>
  );
};

// Individual Routes
const FeaturesPage = () => (
  <>
    <Features />
    <Footer />
  </>
);
const PricingPage = () => (
  <>
    <Pricing />
    <Footer />
  </>
);
const TestimonialsPage = () => (
  <>
    <Testimonials />
    <Footer />
  </>
);
const ContactPage = () => (
  <>
    <Contact />
    <Footer />
  </>
);

// App
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Router>
  );
}
