import { motion } from "framer-motion";
import { useState } from "react";
import { FaQuestionCircle, FaHeadset, FaInfoCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function HelpCenter() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6 },
    }),
  };

  const faqs = [
    {
      q: "How do I find a lodge or apartment on MoreLink?",
      a: "Simply visit the Home page, browse available listings, and use filters to narrow down by location, price, or amenities. Once you find a suitable option, click to view details or contact the host.",
    },
    {
      q: "Can I list my own lodge or room for rent?",
      a: "Yes! Create an account, go to the 'List Your Lodge' page, and fill in your property details. Once reviewed, your lodge will appear publicly on the platform.",
    },
    {
      q: "Is payment made directly to the host?",
      a: "For your safety, payments are processed securely through MoreLink’s platform. Hosts receive funds once you check in successfully.",
    },
    {
      q: "How do I report a problem with a booking?",
      a: "Go to your booking history, select the booking in question, and click 'Report Issue'. Our support team will reach out within 24 hours.",
    },
    {
      q: "Can I cancel a booking?",
      a: "Yes, you can cancel through your dashboard. Refund eligibility depends on the host’s cancellation policy.",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-purple-50 min-h-screen text-gray-800">
      {/* Hero Section */}
      <section className="relative text-center py-20 bg-gradient-to-r from-indigo-700 to-purple-700 text-white overflow-hidden">
        <div>
          <i
            onClick={() => navigate(-1)}
            class="fa-solid fa-arrow-left cursor-pointer py-5 pr-10 absolute top-2 left-4 z-10"
          ></i>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          Help Center
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg md:text-xl max-w-2xl mx-auto px-6"
        >
          Find quick answers, get support, and learn how to make the most of
          your MoreLink Lodge experience.
        </motion.p>

        <div className="absolute top-10 left-10 w-44 h-44 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl"></div>
      </section>

      {/* Help Categories */}
      <section className="py-14 px-6 md:px-16 lg:px-24 text-center">
        <h2 className="text-3xl font-bold text-indigo-700 mb-10">
          Explore Topics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <FaInfoCircle size={40} className="text-indigo-600 mb-3" />,
              title: "Getting Started",
              desc: "Learn how to create an account, find lodges, and make bookings easily.",
            },
            {
              icon: (
                <FaQuestionCircle size={40} className="text-indigo-600 mb-3" />
              ),
              title: "Listing & Hosting",
              desc: "Guidelines for listing lodges, managing availability, and handling guests.",
            },
            {
              icon: <FaHeadset size={40} className="text-indigo-600 mb-3" />,
              title: "Payments & Security",
              desc: "Understand how payments work, refund policies, and safety measures.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-transform hover:-translate-y-1"
            >
              {item.icon}
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16 px-6 md:px-16 lg:px-28">
        <h2 className="text-3xl font-bold text-indigo-700 text-center mb-10">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mb-4 border-b border-gray-200 pb-3"
            >
              <button
                onClick={() => toggleFAQ(i)}
                className="w-full flex justify-between items-center text-left text-lg font-medium text-gray-700 focus:outline-none"
              >
                {faq.q}
                <span
                  className={`transition-transform duration-300 ${
                    openIndex === i ? "rotate-180 text-indigo-600" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={
                  openIndex === i
                    ? { height: "auto", opacity: 1 }
                    : { height: 0, opacity: 0 }
                }
                transition={{ duration: 0.4 }}
                className="overflow-hidden text-gray-600 mt-2"
              >
                <p>{faq.a}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Support Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Still Need Help?
        </h2>
        <p className="text-lg mb-8 px-4 md:px-0">
          Can’t find what you’re looking for? Our support team is always ready
          to help.
        </p>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="/contact"
          className="bg-white text-blue-700 font-semibold py-3 px-8 rounded-lg shadow hover:bg-gray-100 transition"
        >
          Contact Support
        </motion.a>
      </motion.section>
    </div>
  );
}
