import { motion } from "framer-motion";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

export default function ContactUs() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen text-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-center py-20 bg-gradient-to-r from-indigo-700 to-purple-600 text-white">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          Get in Touch
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl max-w-2xl mx-auto"
        >
          Have a question, suggestion, or need assistance? We’d love to hear
          from you.
        </motion.p>

        {/* Background Decorative Circles */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-20 px-6 md:px-16 lg:px-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
          {/* Contact Info */}
          <div>
            <motion.h2
              custom={0}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-3xl font-bold mb-6 text-indigo-700"
            >
              Contact Information
            </motion.h2>

            <motion.p
              custom={1}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-gray-600 mb-8"
            >
              Feel free to reach out to us anytime — our support team is
              available 24/7 to assist with your questions, booking issues, or
              listing inquiries.
            </motion.p>

            <motion.div
              custom={2}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="space-y-5"
            >
              <div className="flex items-center gap-4">
                <FaPhoneAlt className="text-indigo-700 text-xl" />
                <span>+234 806 163 2276</span>
              </div>
              <div className="flex items-center gap-4">
                <FaEnvelope className="text-indigo-700 text-xl" />
                <span>support@morelinklodge.com</span>
              </div>
              <div className="flex items-center gap-4">
                <FaMapMarkerAlt className="text-indigo-700 text-xl" />
                <span>5 Aku Road, Nsukka, Enugu State, Nigeria</span>
              </div>
            </motion.div>

            <motion.div
              custom={3}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mt-10"
            >
              <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                Office Hours
              </h3>
              <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
              <p>Saturday: 9:00 AM - 4:00 PM</p>
              <p>Sunday: Closed</p>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.form
            custom={4}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white shadow-lg rounded-3xl p-8 space-y-6 border border-gray-100"
          >
            <h3 className="text-2xl font-bold text-indigo-700 mb-4">
              Send us a Message
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <input
              type="email"
              placeholder="Your Email"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <textarea
              placeholder="Your Message"
              rows="5"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            ></textarea>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Send Message
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* Map Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative h-[350px] md:h-[450px] overflow-hidden rounded-t-3xl shadow-lg"
      >
        <iframe
          title="MoreLink Lodge Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3931.753672433041!2d7.389982675069212!3d6.858013793145095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1044e9424c7d4a1f%3A0x66b198ffdf71eb3!2sNsukka%2C%20Enugu%20State!5e0!3m2!1sen!2sng!4v1704205805329!5m2!1sen!2sng"
          width="100%"
          height="100%"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </motion.section>
    </div>
  );
}
