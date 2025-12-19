"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#4B3F72] min-h-screen">
      {/* HERO */}
      <section className="bg-[#00C2D1] py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          Privacy Policy
        </h1>
        <p className="mt-4 text-lg text-slate-100 max-w-3xl mx-auto">
          At <span className="text-yellow-300 font-bold">COLLTECH</span>, your
          privacy and trust are our priority.
        </p>
      </section>

      {/* CONTENT */}
      <section className="max-w-5xl mx-auto px-6 py-14 space-y-6">
        {sections.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-md"
          >
            <h2 className="text-xl font-bold text-[#00C2D1] mb-2">
              {item.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {item.content}
            </p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect personal information such as names, contact details, addresses, and payment data when you interact with COLLTECH.",
  },
  {
    title: "2. Purpose of Data Collection",
    content:
      "Your data helps us process orders, provide services, improve user experience, and communicate important updates.",
  },
  {
    title: "3. Security Measures",
    content:
      "We apply strong technical and organizational measures to safeguard your personal information.",
  },
  {
    title: "4. Third-Party Sharing",
    content:
      "Data is only shared with essential service providers such as delivery and payment partners.",
  },
  {
    title: "5. Cookies & Analytics",
    content:
      "We use cookies and analytics tools to optimize platform performance and usability.",
  },
  {
    title: "6. User Rights",
    content:
      "You may request access, updates, or deletion of your personal data at any time.",
  },
  {
    title: "7. Policy Updates",
    content:
      "COLLTECH reserves the right to update this Privacy Policy when necessary.",
  },
  {
    title: "8. Contact Information",
    content:
      "For privacy inquiries, reach out via our official support channels.",
  },
];
