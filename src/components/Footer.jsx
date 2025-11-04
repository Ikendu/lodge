import { motion } from "framer-motion";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { Link as ScrollLink } from "react-scroll";
import { Link, useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const footerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      variants={footerVariants}
      viewport={{ once: true }}
      className="relative bg-gradient-to-r from-indigo-800 via-purple-700 to-blue-700 text-white pt-16 pb-8 px-6 md:px-20 overflow-hidden"
    >
      {/* Wave Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg
          className="relative block w-full h-10"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1200 120"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86C634,2.09,714,3,796.67,25.05,878.75,46.9,959,91.17,1040,105.81c72.88,12.95,146.36,4.17,219.42-13.69V120H0V16.48A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-current text-blue-600 opacity-40"
          ></path>
        </svg>
      </div>

      {/* Footer Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* About Section */}
        <div>
          <h3 className="text-2xl font-bold mb-4">MoreLink Lodge</h3>
          <p className="text-gray-200 leading-relaxed">
            Connecting travelers, students, and tenants with affordable and
            comfortable lodging options. Whether you’re listing or finding a
            space, we make it seamless and secure.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <motion.span
                whileHover={{ x: 5, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer hover:text-yellow-300"
                onClick={() => navigate("/")}
              >
                Home
              </motion.span>
            </li>

            <li>
              {/* Scroll to lodge list on same page */}
              <ScrollLink
                to="lodge-list"
                smooth={true}
                duration={600}
                offset={-80}
                className="cursor-pointer hover:text-yellow-300 block"
              >
                <motion.span whileHover={{ x: 5, scale: 1.05 }}>
                  Find a Lodge
                </motion.span>
              </ScrollLink>
            </li>

            <li>
              <motion.span
                whileHover={{ x: 5, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="cursor-pointer hover:text-yellow-300"
                onClick={() => navigate("/list_new_lodge")}
              >
                List Your Lodge
              </motion.span>
            </li>

            <li>
              <motion.span
                whileHover={{ x: 5, scale: 1.05 }}
                className="cursor-pointer hover:text-yellow-300"
                onClick={() => navigate("/faqs")}
              >
                FAQs
              </motion.span>
            </li>

            <li>
              <motion.span
                whileHover={{ x: 5, scale: 1.05 }}
                className="cursor-pointer hover:text-yellow-300"
                onClick={() => navigate("/contact")}
              >
                Contact Us
              </motion.span>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Support</h4>
          <ul className="space-y-2">
            <li>
              <Link
                to="/privacy-policy"
                className="hover:text-yellow-300 block"
              >
                <motion.span whileHover={{ x: 5, scale: 1.05 }}>
                  Privacy Policy
                </motion.span>
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-yellow-300 block">
                <motion.span whileHover={{ x: 5, scale: 1.05 }}>
                  Terms & Conditions
                </motion.span>
              </Link>
            </li>
            <li>
              <Link to="/help" className="hover:text-yellow-300 block">
                <motion.span whileHover={{ x: 5, scale: 1.05 }}>
                  Help Center
                </motion.span>
              </Link>
            </li>
            <li>
              <Link to="/safety" className="hover:text-yellow-300 block">
                <motion.span whileHover={{ x: 5, scale: 1.05 }}>
                  Safety Tips
                </motion.span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
          <div className="flex items-center gap-3 mb-2">
            <FaPhoneAlt className="text-yellow-400" />
            <a href="tel:+2349023977057" className="hover:underline">
              +234 902 397 7057
            </a>
            <a
              href="https://wa.me/2349023977057"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-2 text-white/90 bg-green-600 p-2 rounded-full"
              aria-label="Chat on WhatsApp"
            >
              <FaWhatsapp />
            </a>
          </div>
          <p className="flex items-center gap-2 mb-4">
            <FaEnvelope className="text-yellow-400" /> services@morelinks.com.ng
          </p>

          {/* Socials */}
          <div className="flex space-x-4 mt-3">
            {[
              { Icon: FaFacebook, link: "https://facebook.com" },
              { Icon: FaInstagram, link: "https://instagram.com" },
              { Icon: FaTwitter, link: "https://twitter.com" },
            ].map(({ Icon, link }, i) => (
              <motion.a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.3, rotate: 5 }}
                className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition"
              >
                <Icon size={20} />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-center text-sm text-gray-200 border-t border-white/20 pt-4"
      >
        © {new Date().getFullYear()}{" "}
        <span className="text-yellow-300 font-semibold">MoreLink Lodge</span>.
        All rights reserved.
      </motion.div>
    </motion.footer>
  );
}
