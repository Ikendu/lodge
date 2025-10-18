import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-900 leading-relaxed">
      <h1 id="top" className="text-3xl font-bold text-blue-700 mb-6">
        Terms & Conditions
      </h1>

      <p className="mb-6">
        These Terms & Conditions ("<strong>Terms</strong>") govern your access
        to and use of the services, website and applications provided by{" "}
        <strong>MoreLink Lodge</strong> (“we”, “us” or “our”), a platform that
        connects lodge/room owners with persons seeking short- or medium-term
        accommodation (collectively, the “<strong>Platform</strong>”). By using
        the Platform you agree to these Terms. If you do not agree, do not use
        the Platform.
      </p>

      {/* Table of contents */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <h2 className="font-semibold mb-2">Contents</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>
            <a href="#definitions" className="text-blue-600 hover:underline">
              Definitions
            </a>
          </li>
          <li>
            <a href="#acceptance" className="text-blue-600 hover:underline">
              Acceptance & Eligibility
            </a>
          </li>
          <li>
            <a href="#account" className="text-blue-600 hover:underline">
              Account Registration & Verification
            </a>
          </li>
          <li>
            <a href="#listings" className="text-blue-600 hover:underline">
              Listings & Owner Obligations
            </a>
          </li>
          <li>
            <a href="#bookings" className="text-blue-600 hover:underline">
              Bookings & Payments
            </a>
          </li>
          <li>
            <a href="#cancellations" className="text-blue-600 hover:underline">
              Cancellations & Refunds
            </a>
          </li>
          <li>
            <a href="#fees" className="text-blue-600 hover:underline">
              Fees and Taxes
            </a>
          </li>
          <li>
            <a href="#reviews" className="text-blue-600 hover:underline">
              Reviews & Ratings
            </a>
          </li>
          <li>
            <a href="#content" className="text-blue-600 hover:underline">
              Content, IP & License
            </a>
          </li>
          <li>
            <a href="#conduct" className="text-blue-600 hover:underline">
              User Conduct & Obligations
            </a>
          </li>
          <li>
            <a href="#liability" className="text-blue-600 hover:underline">
              Limitation of Liability
            </a>
          </li>
          <li>
            <a href="#indemnity" className="text-blue-600 hover:underline">
              Indemnification
            </a>
          </li>
          <li>
            <a href="#privacy" className="text-blue-600 hover:underline">
              Privacy & Data Protection
            </a>
          </li>
          <li>
            <a href="#termination" className="text-blue-600 hover:underline">
              Termination & Suspension
            </a>
          </li>
          <li>
            <a href="#disputes" className="text-blue-600 hover:underline">
              Dispute Resolution & Governing Law
            </a>
          </li>
          <li>
            <a href="#changes" className="text-blue-600 hover:underline">
              Changes to the Terms or the Platform
            </a>
          </li>
          <li>
            <a href="#contact" className="text-blue-600 hover:underline">
              Contact Information
            </a>
          </li>
          <li>
            <a href="#misc" className="text-blue-600 hover:underline">
              Miscellaneous
            </a>
          </li>
        </ol>
      </div>

      {/* Sections */}
      <section id="definitions" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">1. Definitions</h2>
        <p>
          <strong>"Guest"</strong> means any individual who makes a booking to
          stay in a property listed on the Platform. <strong>"Host"</strong> or{" "}
          <strong>"Owner"</strong> means a person or entity that lists a
          property on the Platform. <strong>"Listing"</strong> means a property
          (lodge, room, apartment) advertised on the Platform.{" "}
          <strong>"Booking"</strong> means a confirmed reservation for a
          Listing. Other capitalized terms used in these Terms have the meanings
          provided in the specific sections in which they appear.
        </p>
      </section>

      <section id="acceptance" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          2. Acceptance & Eligibility
        </h2>
        <p>
          By using the Platform you represent and warrant that you are at least
          18 years old and have the legal capacity to enter these Terms. You
          must comply with all applicable laws and regulations when using the
          Platform.
        </p>
      </section>

      <section id="account" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          3. Account Registration & Verification
        </h2>
        <p className="mb-2">
          To use certain features you must create an account. When registering
          you agree to:
        </p>
        <ul className="list-disc ml-6 mb-3">
          <li>Provide accurate, current and complete information.</li>
          <li>Keep your credentials secure and not share them.</li>
          <li>
            Notify us immediately if you suspect unauthorized use of your
            account.
          </li>
        </ul>
        <p>
          We may require identity verification (e.g., NIN verification,
          ID/passport, phone verification) to use some services. You consent to
          any verification checks we reasonably require. Refusal to verify may
          limit your ability to use the Platform.
        </p>
      </section>

      <section id="listings" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          4. Listings & Host Obligations
        </h2>
        <p className="mb-2">
          By listing a property you confirm and agree that:
        </p>
        <ul className="list-disc ml-6 mb-3">
          <li>
            You own or are authorised to list the property and have the legal
            right to accept bookings.
          </li>
          <li>
            Listings are accurate, inclusive of amenities, pricing, availability
            and rules. Hosts must promptly update listings when details change.
          </li>
          <li>
            You will maintain the property in a safe, clean and habitable
            condition and comply with applicable health, safety and housing
            laws.
          </li>
          <li>
            You must disclose material facts affecting the stay (e.g., major
            renovation, restricted access, known defects).
          </li>
          <li>
            Hosts must respond to booking enquiries and messages promptly and
            professionally.
          </li>
        </ul>
      </section>

      <section id="bookings" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">5. Bookings & Payments</h2>
        <p className="mb-2">
          Booking a Listing creates a binding agreement between Guest and Host
          for the specified dates and price, subject to the Host’s cancellation
          policy and these Terms.
        </p>
        <ul className="list-disc ml-6 mb-3">
          <li>
            <strong>Payment processing:</strong> Payments are processed through
            third-party payment providers. By making a booking you authorize the
            collection of payments and any applicable fees.
          </li>
          <li>
            <strong>Pricing:</strong> Prices shown include amounts set by Hosts
            and any Platform fees. Additional taxes, security deposits or fees
            may apply.
          </li>
          <li>
            <strong>Confirmation:</strong> Bookings are confirmed only after
            payment is processed and you receive a booking confirmation.
          </li>
          <li>
            <strong>Security deposits:</strong> Hosts may request security
            deposits. The Platform may facilitate collection, holding and
            release of deposits via payment provider—terms for deposits differ
            by Host.
          </li>
        </ul>
      </section>

      <section id="cancellations" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          6. Cancellations, Modifications & Refunds
        </h2>
        <p className="mb-2">
          Cancellation rights and refund amounts vary by Listing and by Host.
          Before booking, review the Listing’s cancellation policy carefully.
        </p>
        <ul className="list-disc ml-6 mb-3">
          <li>
            If you cancel a confirmed booking, refunds (if any) are calculated
            according to the Host’s published policy.
          </li>
          <li>
            Hosts may cancel bookings due to unforeseen circumstances. Where the
            Host cancels, we will attempt to assist you with alternative
            accommodation or refund the booking as applicable.
          </li>
          <li>
            Processing times for refunds depend on payment providers and may
            take several business days.
          </li>
        </ul>
      </section>

      <section id="fees" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          7. Fees, Taxes & Payment Disputes
        </h2>
        <p className="mb-2">
          We (or our Hosts) may charge Platform fees. Users are responsible for
          applicable taxes. If there is a payment dispute, contact our
          support—payment providers and Hosts may have separate dispute
          resolution processes.
        </p>
      </section>

      <section id="reviews" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">8. Reviews & Ratings</h2>
        <p className="mb-2">
          Guests and Hosts may leave reviews. Reviews should be honest and
          accurate. We reserve the right to remove reviews that violate our
          content policy or are fraudulent, abusive, defamatory or irrelevant.
        </p>
      </section>

      <section id="content" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          9. Content, Intellectual Property & License
        </h2>
        <p className="mb-2">
          The Platform and its content (text, logos, images, code) are protected
          by intellectual property laws. You agree not to copy, reproduce or
          distribute our protected content without authorization.
        </p>
        <p className="mb-2">
          By submitting photos, descriptions or other content to a Listing or to
          the Platform you grant us a worldwide, non-exclusive, royalty-free
          license to use, reproduce, display and promote such content in
          connection with the Platform and marketing.
        </p>
      </section>

      <section id="conduct" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          10. User Conduct & Prohibited Activities
        </h2>
        <p className="mb-2">Users must not:</p>
        <ul className="list-disc ml-6 mb-3">
          <li>
            Use the Platform for illegal activities or to violate any law or
            regulation.
          </li>
          <li>Post fraudulent Listings or misrepresent properties.</li>
          <li>
            Attempt to solicit direct bookings off-platform to avoid Platform
            fees.
          </li>
          <li>Abuse, harass or defame other users or hosts.</li>
          <li>Attempt to access other users’ accounts or data.</li>
        </ul>
      </section>

      <section id="safety" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          11. Safety, House Rules & Property Use
        </h2>
        <p className="mb-2">
          Guests must follow the Listing’s house rules and any local laws. Hosts
          should provide accurate guidance on rules and access. Report any
          unsafe conditions immediately to the Host and to MoreLink Lodge
          support.
        </p>
      </section>

      <section id="liability" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          12. Limitation of Liability
        </h2>
        <p className="mb-2">
          To the fullest extent permitted by law, MoreLink Lodge and its
          officers, employees, agents and partners are not liable for:
        </p>
        <ul className="list-disc ml-6 mb-3">
          <li>
            Any direct, indirect, incidental, punitive, special or consequential
            losses arising from your use of the Platform.
          </li>
          <li>
            Loss or damage arising from Listings, bookings, interactions with
            Hosts or Guests, or third-party websites and services.
          </li>
        </ul>
        <p>
          Our aggregate liability for proven losses directly caused by our gross
          negligence or willful misconduct is limited to the fees paid to
          MoreLink Lodge in respect of the relevant transaction(s).
        </p>
      </section>

      <section id="indemnity" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">13. Indemnification</h2>
        <p className="mb-2">
          You agree to indemnify, defend and hold harmless MoreLink Lodge and
          its affiliates from any claims, liabilities, damages, losses, and
          expenses arising from:
        </p>
        <ul className="list-disc ml-6 mb-3">
          <li>Your breach of these Terms;</li>
          <li>
            Your negligence, willful misconduct or violation of applicable laws;
          </li>
          <li>
            Claims by third parties resulting from your use of the Platform
            (including bookings and Listings).
          </li>
        </ul>
      </section>

      <section id="privacy" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          14. Privacy & Data Protection
        </h2>
        <p className="mb-2">
          Our Privacy Policy explains how we collect and use personal data. By
          using the Platform, you consent to the collection, use and transfer of
          your data as described in our Privacy Policy. For Nigeria-based users,
          we comply with the Nigeria Data Protection Regulation (NDPR) where
          applicable.
        </p>
      </section>

      <section id="thirdparty" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          15. Third-Party Services
        </h2>
        <p className="mb-2">
          The Platform may integrate third-party services (payment processors,
          mapping, analytics). Such services may have their own terms and
          privacy policies. We are not responsible for third-party practices or
          availability.
        </p>
      </section>

      <section id="termination" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          16. Termination & Suspension
        </h2>
        <p className="mb-2">
          We may suspend or terminate accounts or remove Listings where a user
          breaches these Terms or where required by law. If we terminate your
          account for breach, any outstanding bookings or payments may remain
          enforceable in accordance with the applicable cancellation policies.
        </p>
      </section>

      <section id="disputes" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          17. Dispute Resolution & Governing Law
        </h2>
        <p className="mb-2">
          These Terms are governed by the laws of the{" "}
          <strong>Federal Republic of Nigeria</strong>. Any dispute arising out
          of or relating to these Terms will be resolved in the courts of
          Nigeria. Before starting court proceedings, you and MoreLink Lodge
          will attempt to resolve the dispute informally through our support
          channels.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          <em>Note:</em> For certain consumer disputes, mandatory local dispute
          resolution procedures may apply.
        </p>
      </section>

      <section id="changes" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          18. Changes to the Platform or Terms
        </h2>
        <p className="mb-2">
          We may update these Terms from time to time. We will provide notice of
          material changes (e.g., by email or posting a prominent notice).
          Continued use of the Platform after changes means you accept the
          updated Terms.
        </p>
      </section>

      <section id="contact" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">19. Contact Information</h2>
        <p className="mb-2">
          If you have questions about these Terms, please contact us:
        </p>
        <p className="mb-1">
          <strong>Email:</strong> support@morelinklodge.com
        </p>
        <p className="mb-1">
          <strong>Phone:</strong> +234 902 397 7057
        </p>
        <p className="mb-1">
          <strong>Address:</strong> 5 Aku Road, Nsukka, Enugu State, Nigeria
        </p>
      </section>

      <section id="misc" className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">20. Miscellaneous</h2>
        <ul className="list-disc ml-6 mb-3">
          <li>
            These Terms, together with our Privacy Policy and any other
            documents expressly incorporated by reference, form the entire
            agreement between you and MoreLink Lodge.
          </li>
          <li>
            If any provision of these Terms is held invalid, the remainder will
            continue in full force and effect.
          </li>
          <li>
            We may assign our rights under these Terms to a third party on
            notice to you.
          </li>
        </ul>
      </section>

      <div className="mt-8 text-sm text-gray-600">
        <strong>Disclaimer:</strong> This Terms & Conditions template is
        provided for general informational purposes only and does not constitute
        legal advice. You should consult a qualified attorney to ensure these
        Terms meet legal requirements for your specific business model and
        jurisdiction.
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <em>Last updated: October 2025</em>
      </div>

      {/* Back to top */}
      <div className="mt-8">
        <a href="#top" className="text-blue-600 hover:underline">
          Back to top
        </a>
      </div>
    </div>
  );
}
