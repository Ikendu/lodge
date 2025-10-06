import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";

export default function Footer() {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2 });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  const handleScroll = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const footerVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <motion.footer
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={footerVariants}
      className="bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-800 text-white py-12 mt-20"
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand Section */}
        <div>
          <h2 className="text-2xl font-extrabold text-yellow-400 mb-4">
            MoreLink Lodge
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Connecting travelers with comfortable and affordable lodges across
            Nigeria. Find your next stay with ease and comfort.
          </p>

          <div className="flex space-x-5 mt-6">
            <motion.a
              href="#"
              whileHover={{ scale: 1.2 }}
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              <FaFacebook size={22} />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.2 }}
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              <FaInstagram size={22} />
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.2 }}
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              <FaTwitter size={22} />
            </motion.a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col md:flex-row md:space-x-10">
          <div>
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleScroll("home")}
                  className="hover:text-yellow-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScroll("lodges")}
                  className="hover:text-yellow-400 transition-colors"
                >
                  Find a Lodge
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleScroll("register-owner")}
                  className="hover:text-yellow-400 transition-colors"
                >
                  List a Lodge
                </button>
              </li>
              <li>
                <a
                  href="/faq"
                  className="hover:text-yellow-400 transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="mt-6 md:mt-0">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/contact" className="hover:text-yellow-400 transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-yellow-400 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-yellow-400 transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-yellow-400 transition">
                  About Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-semibold text-yellow-300 mb-4">
            Contact Us
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center space-x-3">
              <FaEnvelope className="text-yellow-400" />
              <span>support@morelinklodge.com</span>
            </li>
            <li className="flex items-center space-x-3">
              <FaPhoneAlt className="text-yellow-400" />
              <span>+234 816 123 4567</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/20 mt-10 pt-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} MoreLink Lodge. All Rights Reserved.
      </div>
    </motion.footer>
  );
}
