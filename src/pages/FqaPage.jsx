import { useState } from "react";
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
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden transition shadow-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100"
              >
                {faq.question}
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-4 py-3 text-gray-600 bg-gray-50 border-t">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
