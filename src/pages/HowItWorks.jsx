import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logos/logos.png";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {/* Hero */}
      <motion.section
        className="max-w-6xl mx-auto px-4 py-12 sm:py-20"
        initial="hidden"
        animate="show"
        variants={fade}
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 md:p-10 text-white shadow-xl overflow-hidden">
          <div className="md:flex md:items-center md:justify-between gap-6">
            <div className="md:flex-1">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={logo}
                  className="w-12 h-12 rounded-md bg-white/20 p-2"
                  alt="logo"
                />
                <span className="text-sm font-semibold opacity-90">
                  MoreLinks Lodge
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                How It Works — Register. List. Earn. Book.
              </h1>
              <p className="mt-3 text-indigo-100 max-w-lg">
                A simple, secure process for guests and owners to find great
                places or list their lodge — with identity verification,
                calendar availability & seamless payments.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/registeruser"
                  className="inline-flex items-center justify-center bg-white text-indigo-700 font-semibold px-5 py-3 rounded-lg shadow hover:scale-[1.02] transition"
                >
                  Create Account
                </Link>
                <Link
                  to="/list_new_lodge"
                  className="inline-flex items-center justify-center bg-indigo-500/90 text-white font-semibold px-5 py-3 rounded-lg shadow hover:scale-[1.02] transition"
                >
                  List Your Lodge
                </Link>
              </div>
            </div>

            <motion.div
              className="mt-6 md:mt-0 md:w-1/3 bg-white/10 rounded-2xl p-4 shadow-inner"
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <div className="text-sm text-indigo-50 font-semibold mb-2">
                For Guests
              </div>
              <ul className="text-sm space-y-2 text-indigo-100">
                <li>Find verified lodges in minutes</li>
                <li>Secure payments & instant receipts</li>
                <li>24/7 support and simple refunds</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Steps */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-6">
          Simple steps to get started
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-transform"
            whileHover={{ y: -6 }}
          >
            <div className="text-3xl font-bold text-indigo-600">1</div>
            <h3 className="font-semibold mt-3">Create an Account</h3>
            <p className="text-sm mt-2 text-slate-600">
              Sign up with your email and verify your identity to unlock
              bookings and listing features.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-transform"
            whileHover={{ y: -6 }}
          >
            <div className="text-3xl font-bold text-indigo-600">2</div>
            <h3 className="font-semibold mt-3">Verify Identity</h3>
            <p className="text-sm mt-2 text-slate-600">
              Complete NIN verification (owners) so guests can trust listings —
              it's fast and secure.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-transform"
            whileHover={{ y: -6 }}
          >
            <div className="text-3xl font-bold text-indigo-600">3</div>
            <h3 className="font-semibold mt-3">List Your Lodge</h3>
            <p className="text-sm mt-2 text-slate-600">
              Add photos, amenities, price, and availability — our calendar
              keeps bookings synchronized.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-transform"
            whileHover={{ y: -6 }}
          >
            <div className="text-3xl font-bold text-indigo-600">4</div>
            <h3 className="font-semibold mt-3">Start Earning / Book</h3>
            <p className="text-sm mt-2 text-slate-600">
              Guests book in a few taps. Owners get paid reliably — with clear
              receipts and reporting.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-4 py-12 bg-gradient-to-b from-white to-slate-50 rounded-xl">
        <h2 className="text-2xl font-bold text-center mb-6">
          Why list with MoreLinks?
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <motion.div
            className="bg-white rounded-xl p-6 shadow hover:shadow-lg"
            whileHover={{ y: -6 }}
          >
            <h4 className="font-semibold text-indigo-600">Reach Thousands</h4>
            <p className="text-sm text-slate-600 mt-2">
              Your lodge appears to guests searching nearby or by vibe — more
              visibility, more bookings.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow hover:shadow-lg"
            whileHover={{ y: -6 }}
          >
            <h4 className="font-semibold text-indigo-600">Verified Guests</h4>
            <p className="text-sm text-slate-600 mt-2">
              Identity checks reduce fraud and increase trust — owners see
              verified guests before accepting bookings.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-6 shadow hover:shadow-lg"
            whileHover={{ y: -6 }}
          >
            <h4 className="font-semibold text-indigo-600">Simple Payments</h4>
            <p className="text-sm text-slate-600 mt-2">
              Secure payment flow and prompt payouts keep owners happy and
              guests worry-free.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-indigo-700 rounded-2xl p-6 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Ready to get started?</h3>
            <p className="text-indigo-100 mt-1">
              Sign up now and join a growing community of hosts and guests.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/registeruser"
              className="bg-white text-indigo-700 px-4 py-2 rounded-md font-semibold"
            >
              Create Account
            </Link>
            <Link
              to="/list_new_lodge"
              className="bg-indigo-900/30 px-4 py-2 rounded-md border border-white/20"
            >
              List Your Lodge
            </Link>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-slate-600">
        <div>
          Need help?{" "}
          <Link to="/help" className="text-indigo-600">
            Visit our Help Center
          </Link>{" "}
          or{" "}
          <Link to="/contact" className="text-indigo-600">
            Contact us
          </Link>
          .
        </div>
      </footer>
    </div>
  );
}
