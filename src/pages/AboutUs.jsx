import React from "react";
import { motion } from "framer-motion";
import { FaUsers, FaHandshake, FaHome, FaShieldAlt } from "react-icons/fa";

export default function AboutUs() {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-700 text-white py-20 px-6 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About <span className="text-yellow-300">MoreLink Lodge</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200">
            Making accommodation simple, affordable, and accessible — one stay
            at a time.
          </p>
        </motion.div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
          <svg
            className="relative block w-full h-10"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 1200 120"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86C634,2.09,714,3,796.67,25.05,878.75,46.9,959,91.17,1040,105.81c72.88,12.95,146.36,4.17,219.42-13.69V120H0V16.48A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-current text-white opacity-30"
            ></path>
          </svg>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-6xl mx-auto py-16 px-6 text-center">
        <motion.div initial="hidden" whileInView="visible" variants={fadeUp}>
          <h2 className="text-3xl font-semibold mb-4 text-blue-800">
            Who We Are
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed max-w-4xl mx-auto">
            <strong>MoreLink Lodge</strong> is a modern accommodation platform
            that connects travelers, students, and tenants with verified and
            affordable lodges across Nigeria. Whether you’re searching for a
            short-term stay or listing your space for rent, we make the process
            seamless, transparent, and secure.
            <br />
            <br />
            Founded with the goal of bridging the housing gap, we empower
            individuals and property owners by simplifying access to safe and
            reliable accommodations through technology.
          </p>
        </motion.div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            className="p-6 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition"
          >
            <FaHome size={40} className="mx-auto text-blue-700 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Our Mission
            </h3>
            <p className="text-gray-600">
              To simplify accommodation for everyone by connecting people with
              affordable, verified, and comfortable lodges using modern
              technology.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            className="p-6 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition"
          >
            <FaUsers size={40} className="mx-auto text-purple-700 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">Our Vision</h3>
            <p className="text-gray-600">
              To become Africa’s most trusted digital platform for accommodation
              discovery, creating opportunities and comfort for millions.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            className="p-6 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition"
          >
            <FaShieldAlt size={40} className="mx-auto text-indigo-700 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Our Core Values
            </h3>
            <ul className="text-gray-600 space-y-1">
              <li>✔ Trust & Transparency</li>
              <li>✔ Safety & Comfort</li>
              <li>✔ Innovation & Growth</li>
              <li>✔ Community Impact</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeUp}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-semibold mb-4 text-blue-800">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our process is simple, fast, and built around trust between guests
            and hosts.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "1. Search for Lodges",
              text: "Browse through verified listings with photos, amenities, and prices to find your perfect stay.",
              icon: <FaHome className="text-blue-700 mx-auto mb-3" size={36} />,
            },
            {
              title: "2. Connect & Book",
              text: "Contact hosts directly through our platform to make inquiries or secure your booking instantly.",
              icon: (
                <FaHandshake
                  className="text-purple-700 mx-auto mb-3"
                  size={36}
                />
              ),
            },
            {
              title: "3. Stay with Confidence",
              text: "Enjoy a safe, comfortable, and transparent lodging experience from trusted hosts.",
              icon: (
                <FaShieldAlt
                  className="text-indigo-700 mx-auto mb-3"
                  size={36}
                />
              ),
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              variants={fadeUp}
              className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition"
            >
              {step.icon}
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-100 py-16 px-6 text-center">
        <motion.div initial="hidden" whileInView="visible" variants={fadeUp}>
          <h2 className="text-3xl font-semibold mb-6 text-blue-800">
            Our Team
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-10">
            Our dedicated team of innovators, designers, and community builders
            share one goal — to make finding and managing accommodation simpler
            for everyone.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { name: "Chibundu Aniede", role: "Founder & CEO" },
              { name: "Grace N.", role: "Product Designer" },
              { name: "Emeka O.", role: "Software Engineer" },
              { name: "Ada M.", role: "Marketing Lead" },
              { name: "Ifeanyi C.", role: "Community Manager" },
              { name: "Ngozi A.", role: "Customer Success" },
            ].map((member, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-3 flex items-center justify-center text-white text-2xl font-semibold">
                  {member.name.charAt(0)}
                </div>
                <h4 className="font-bold text-gray-800">{member.name}</h4>
                <p className="text-gray-500 text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Impact / Closing Section */}
      <section className="max-w-5xl mx-auto py-16 px-6 text-center">
        <motion.div initial="hidden" whileInView="visible" variants={fadeUp}>
          <h2 className="text-3xl font-semibold mb-4 text-blue-800">
            Empowering Communities
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto mb-8">
            Beyond providing rooms and lodges, we are building a network of
            trust, opportunity, and comfort. Our commitment extends to
            empowering property owners, supporting local communities, and
            contributing to Nigeria’s housing development goals.
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05 }}
            className="bg-blue-700 text-white px-6 py-3 rounded-full font-medium shadow hover:bg-blue-800 transition"
          >
            Contact Us
          </motion.a>
        </motion.div>
      </section>
    </div>
  );
}
