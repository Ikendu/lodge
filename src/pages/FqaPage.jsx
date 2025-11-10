import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "How do I book a lodge or apartment?",
    answer:
      "Simply create an account, browse available listings, and click on the lodge or apartment you’re interested in. You can then proceed to booking and payment.",
  },
  {
    question: "Do I need to pay before arrival?",
    answer:
      "Yes. To secure your reservation, payment is required before your arrival. This ensures the room is held exclusively for you.",
  },
  {
    question: "Can I cancel or change my booking?",
    answer:
      "Yes, but cancellation policies may vary depending on the property owner. Be sure to check the cancellation rules before booking.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "Absolutely. All payments are processed through trusted and secure payment gateways, ensuring your financial data is protected.",
  },
  {
    question: "Do you verify the property listings?",
    answer:
      "Yes. We carefully verify property owners and their listings before publishing them on our platform to ensure safety and trust.",
  },
  {
    question: "What if I face issues during my stay?",
    answer:
      "You can reach out to our 24/7 support team. We’ll work with both you and the host to resolve any concerns quickly.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-white to-blue-100 p-6 md:p-12 flex justify-center items-start">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full bg-white shadow-lg rounded-2xl p-8 border border-gray-100"
      >
        <div className="flex justify-between">
          <i
            onClick={() => navigate(-1)}
            class="fa-solid fa-arrow-left cursor-pointer pb-10"
          ></i>
          <div></div>
        </div>
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all bg-white overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-5 py-4 text-left font-semibold text-gray-800 hover:bg-blue-50 transition-colors"
              >
                <span>{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-blue-600" />
                  )}
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="px-5 pb-4 text-gray-600 bg-blue-50 border-t border-blue-100"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-10 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Still have questions?{" "}
          <a
            href="/contact"
            className="text-blue-600 font-medium hover:underline"
          >
            Contact our support team
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
