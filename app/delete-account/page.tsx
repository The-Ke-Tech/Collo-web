"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DeleteAccountPage() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-extrabold mb-6">
          Delete Your <span className="text-yellow-300">Account</span>
        </h1>
        <p className="max-w-3xl mx-auto text-lg leading-relaxed text-gray-100">
          At <strong>COLLTECH</strong>, we respect your privacy and give you full control over your data.
          If you wish to permanently delete your account and all associated information, please contact us
          through our <span className="text-yellow-300">Contact Us</span> page.
        </p>
      </div>

      {/* Instructions Section */}
      <div className="bg-white text-gray-800 py-16">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[#00C2D1] mb-4">
              How to Delete Your Account
            </h2>
            <p className="text-lg leading-relaxed">
              To request the deletion of your account, please visit our{" "}
              <Link
                href="/contact-us"
                className="text-[#7B2CBF] font-semibold underline"
              >
                Contact Us
              </Link>{" "}
              page and submit a request. Our support team will guide you through the process.
            </p>
            <p className="mt-4 text-lg leading-relaxed">
              Upon deletion, your personal data including email, profile information, and order history will be permanently removed.
              Some backup data may be retained for up to 90 days for security or legal purposes.
            </p>
          </motion.div>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-[#00C2D1]/40">
              <img
                src="/contact-us-illustration.png"
                alt="Contact Us Illustration"
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Assistance?</h2>
          <p className="max-w-2xl mx-auto mb-6 text-lg text-gray-100">
            Our support team is ready to help with any account-related inquiries. 
            Reach out to us through the Contact Us page to manage your account safely.
          </p>
          <Link
            href="/contact-us"
            className="bg-yellow-300 text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 transition shadow-lg"
          >
            Go to Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
