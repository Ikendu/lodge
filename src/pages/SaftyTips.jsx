import React from "react";

export default function SafetyTips() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-5 sm:px-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Safety Tips for Your Stay at Morelinks Lodge
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            At{" "}
            <span className="font-semibold text-blue-700">Morelinks Lodge</span>
            , your comfort and safety come first. Please take a few minutes to
            review these important safety guidelines to ensure a secure,
            peaceful, and enjoyable stay with us.
          </p>
        </div>

        {/* Section 1: Personal Safety */}
        <section className="mb-10 bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            1. Personal Safety
          </h2>
          <ul className="list-disc pl-6 space-y-3 text-gray-700 leading-relaxed">
            <li>
              Always lock your room door and windows before leaving or sleeping.
            </li>
            <li>
              Keep your room key or access code private — do not share it with
              anyone.
            </li>
            <li>
              Secure your valuables (cash, phone, ID cards) in a safe or hidden
              place.
            </li>
            <li>
              Report any suspicious movements or strangers to the lodge
              management immediately.
            </li>
            <li>
              Follow your instincts — if anything feels unsafe, contact the
              front desk right away.
            </li>
          </ul>
        </section>

        {/* Section 2: Health & Cleanliness */}
        <section className="mb-10 bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            2. Health & Cleanliness
          </h2>
          <ul className="list-disc pl-6 space-y-3 text-gray-700 leading-relaxed">
            <li>
              Maintain good hygiene — wash your hands frequently and keep your
              area neat.
            </li>
            <li>
              Use the waste bins provided to keep your environment clean and
              insect-free.
            </li>
            <li>
              Cooking inside rooms is not allowed unless permitted by
              management.
            </li>
            <li>
              If you feel unwell, inform the front desk for immediate
              assistance.
            </li>
            <li>
              Be considerate — avoid playing loud music or making excessive
              noise, especially at night.
            </li>
          </ul>
        </section>

        {/* Section 3: Fire Safety */}
        <section className="mb-10 bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            3. Fire Safety
          </h2>
          <ul className="list-disc pl-6 space-y-3 text-gray-700 leading-relaxed">
            <li>
              Take note of fire exits and fire extinguisher locations around
              your area.
            </li>
            <li>
              Never leave electrical appliances on when leaving your room.
            </li>
            <li>
              Smoking is prohibited inside rooms — please use designated smoking
              areas.
            </li>
            <li>Avoid overloading electrical sockets or using frayed cords.</li>
            <li>
              In the event of a fire, remain calm, alert others, and follow
              evacuation signs.
            </li>
          </ul>
        </section>

        {/* Section 4: Guest Conduct & Respect */}
        <section className="mb-10 bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            4. Guest Conduct & Respect
          </h2>
          <ul className="list-disc pl-6 space-y-3 text-gray-700 leading-relaxed">
            <li>
              Treat all guests and staff members with respect and courtesy.
            </li>
            <li>
              Do not cause disturbances or engage in violent or disruptive
              behavior.
            </li>
            <li>
              Report any damages or maintenance issues to management
              immediately.
            </li>
            <li>
              Handle lodge property with care; guests are responsible for any
              damage caused.
            </li>
            <li>
              Maintain peace and order — we value a calm and respectful
              atmosphere for everyone.
            </li>
          </ul>
        </section>

        {/* Section 5: Emergency Procedures */}
        <section className="mb-10 bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            5. Emergency Procedures
          </h2>
          <ul className="list-disc pl-6 space-y-3 text-gray-700 leading-relaxed">
            <li>
              Locate emergency exits and familiarize yourself with escape
              routes.
            </li>
            <li>
              In an emergency, contact the lodge’s front desk or security
              immediately.
            </li>
            <li>
              Do not attempt to fix electrical or plumbing faults by yourself —
              call for assistance.
            </li>
            <li>
              In case of power outage, avoid candles — request a flashlight
              instead.
            </li>
            <li>
              Stay calm and follow instructions from staff or emergency
              personnel.
            </li>
          </ul>
        </section>

        {/* Section 6: Online Booking & Scam Awareness */}
        <section className="mb-10 bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            6. Online Booking & Scam Awareness
          </h2>
          <ul className="list-disc pl-6 space-y-3 text-gray-700 leading-relaxed">
            <li>
              Always book through official{" "}
              <span className="font-semibold text-blue-700">
                Morelinks Lodge
              </span>{" "}
              channels or verified partners.
            </li>
            <li>
              Beware of fake listings or people requesting payments outside our
              platform.
            </li>
            <li>
              Never share your personal or payment information with unverified
              individuals.
            </li>
            <li>
              Report any suspicious messages, websites, or calls to our support
              team immediately.
            </li>
            <li>
              Use strong passwords and avoid logging into your account on public
              devices.
            </li>
          </ul>
        </section>

        {/* Contact Section */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-2xl shadow-sm text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Need Help or Have a Safety Concern?
          </h3>
          <p className="text-gray-700 mb-3">
            Your safety and peace of mind matter to us. Please reach out anytime
            you need help or notice anything unusual.
          </p>
          <p className="font-medium text-blue-600">
            📞 Front Desk: +234 902 397 7057 <br />
            📧 Email: support@morelinkslodge.com <br />
            🕒 Available 24/7
          </p>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-10 text-gray-600 text-sm">
          <p>
            © {new Date().getFullYear()} Morelinks Lodge. All Rights Reserved.{" "}
            <br />
            Providing safe, affordable, and comfortable spaces for your stay.
          </p>
        </div>
      </div>
    </div>
  );
}
