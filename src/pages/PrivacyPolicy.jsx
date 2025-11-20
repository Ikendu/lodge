import React from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
      <div>
        <i
          onClick={() => navigate(-1)}
          class="fa-solid fa-arrow-left cursor-pointer py-5 pr-10 absolute top-14 left-4 z-10"
        ></i>
      </div>
      <h1 className="text-3xl font-bold text-blue-700 mb-6 pt-2">
        Privacy Policy
      </h1>
      <p className="mb-4">
        Welcome to <strong>MoreLink Lodge</strong> (“we,” “our,” “us”). Your
        privacy is important to us. This Privacy Policy explains how we collect,
        use, disclose, and protect your personal information when you use our
        website, mobile application, and related services (collectively, the
        “Platform”).
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        1. Information We Collect
      </h2>
      <p className="mb-4">
        We collect different types of information depending on how you use our
        Platform:
      </p>
      <ul className="list-disc ml-6 space-y-2">
        <li>
          <strong>Personal Information:</strong> When you create an account,
          list a property, or book a lodge, we may collect your name, email,
          phone number, payment details, and identification information.
        </li>
        <li>
          <strong>Property Information:</strong> If you list a space, we collect
          details about your property such as address, photos, pricing, and
          amenities.
        </li>
        <li>
          <strong>Usage Data:</strong> We automatically collect information
          about how you use our site, such as IP address, browser type, device
          ID, location (if enabled), and pages visited.
        </li>
        <li>
          <strong>Cookies and Tracking:</strong> We use cookies and similar
          technologies to improve site performance, analyze traffic, and
          personalize your experience.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        2. How We Use Your Information
      </h2>
      <p className="mb-4">We use your information to:</p>
      <ul className="list-disc ml-6 space-y-2">
        <li>Process your registration, bookings, and payments.</li>
        <li>
          Verify user identities to ensure safety and trust on the Platform.
        </li>
        <li>
          Connect lodge owners and guests for booking, messaging, and support.
        </li>
        <li>
          Improve our services, website functionality, and customer experience.
        </li>
        <li>Send updates, special offers, and important notifications.</li>
        <li>Comply with legal obligations and prevent fraudulent activity.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        3. Sharing of Information
      </h2>
      <p className="mb-4">
        We only share your information in limited cases, including:
      </p>
      <ul className="list-disc ml-6 space-y-2">
        <li>
          With <strong>lodge owners</strong> and <strong>guests</strong> for
          confirmed bookings or inquiries.
        </li>
        <li>
          With trusted <strong>third-party service providers</strong> who assist
          in payment processing, verification, hosting, or analytics.
        </li>
        <li>When required by law or to protect legal rights.</li>
        <li>
          During a business transfer, such as a merger or acquisition, where
          your data may be transferred under confidentiality agreements.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        4. Your Rights and Choices
      </h2>
      <p className="mb-4">
        Depending on your location, you may have the right to:
      </p>
      <ul className="list-disc ml-6 space-y-2">
        <li>Access and request a copy of your personal information.</li>
        <li>Request correction or deletion of inaccurate data.</li>
        <li>
          Withdraw consent for data processing (where applicable) or opt out of
          marketing emails.
        </li>
        <li>
          Request that we restrict or stop using your data in certain ways.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-3">5. Data Retention</h2>
      <p className="mb-4">
        We retain your information only for as long as necessary to provide our
        services, fulfill legal obligations, or resolve disputes. Once your data
        is no longer needed, we securely delete or anonymize it.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        6. Security of Your Information
      </h2>
      <p className="mb-4">
        We implement industry-standard security measures such as SSL encryption,
        secure payment gateways, and restricted database access to protect your
        information. However, no online system is 100% secure, so we cannot
        guarantee absolute protection.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        7. Third-Party Links and Services
      </h2>
      <p className="mb-4">
        Our Platform may contain links to third-party websites or services. We
        are not responsible for the privacy practices or content of those
        websites. We encourage you to review their privacy policies.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        8. Children’s Privacy
      </h2>
      <p className="mb-4">
        Our services are not intended for children under 18. We do not knowingly
        collect personal information from minors. If you believe your child has
        provided personal data, please contact us immediately for deletion.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        9. International Data Transfers
      </h2>
      <p className="mb-4">
        If you use our Platform outside Nigeria, your information may be
        transferred and processed in Nigeria or other countries where our
        servers are located. We take appropriate measures to ensure your data
        remains protected.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">
        10. Updates to This Policy
      </h2>
      <p className="mb-4">
        We may update this Privacy Policy occasionally to reflect changes in our
        practices or legal requirements. We’ll notify you through our Platform
        or by email when significant updates occur.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">11. Contact Us</h2>
      <p className="mb-4">
        If you have any questions or concerns about this Privacy Policy or your
        personal data, please contact us:
      </p>
      <p className="mb-2">
        <strong>Email:</strong> support@morelinklodge.com
      </p>
      <p className="mb-2">
        <strong>Address:</strong> 5 Aku Road, Nsukka, Enugu State, Nigeria
      </p>
      <p>
        <strong>Phone:</strong> +234 902 397 7057
      </p>

      <div className="mt-10 text-sm text-gray-500">
        <em>Last Updated: October 2025</em>
      </div>
    </div>
  );
}
