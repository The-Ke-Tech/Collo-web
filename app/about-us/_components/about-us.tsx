"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const stats = [
  { value: "100%", label: "Genuine products" },
  { value: "Kenya-wide", label: "Delivery coverage" },
  { value: "24/7", label: "Online shopping" },
];

const reasons = [
  {
    icon: "🛍️",
    title: "Wide Product Range",
    desc: "From earphones & Bluetooth speakers to routers, printers, and office supplies - we stock only the best.",
  },
  {
    icon: "💰",
    title: "Affordable Pricing",
    desc: "We believe in making technology accessible to everyone without compromising on quality.",
  },
  {
    icon: "🤝",
    title: "Reliable Support",
    desc: "Our friendly team is always here to help with inquiries, product selection, and after-sales support.",
  },
];

export default function AboutContent() {
  return (
    <section className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] text-white">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="container mx-auto px-6 py-20 md:py-28 text-center relative">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            About <span className="text-yellow-300">COLLTECH</span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg leading-relaxed text-gray-100">
            At <strong>COLLTECH</strong>, we&apos;re more than just a store - we&apos;re your{" "}
            <span className="text-yellow-300">trusted partner</span> for premium
            tech gadgets and office supplies across Kenya. Whether it&apos;s
            <em> earphones, Bluetooth speakers, routers, printers </em>, or
            essential office tools, our mission is to provide affordable,
            high-quality solutions for your everyday tech and workplace needs.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-white/15 backdrop-blur px-4 py-4 border border-white/20">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-gray-100">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Founder Section (Animated) */}
      <div className="bg-white text-gray-800 py-16">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[#00C2D1] mb-4">
              Meet Our Founder
            </h2>
            <p className="text-lg leading-relaxed">
              <strong>COLLTECH</strong> was founded by{" "}
              <span className="text-[#7B2CBF] font-semibold">
                Collins Otieno
              </span>, a visionary and strategic entrepreneur with a passion for
              bridging trust, technology, and community impact. Driven by his
              commitment to empowering individuals and businesses, Collins
              started COLLTECH to deliver{" "}
              <strong>reliable tech solutions</strong> and{" "}
              <strong>foster financial growth</strong> in Nairobi and beyond.
            </p>
            <p className="mt-4 text-lg leading-relaxed">
              Through innovation, strategic thinking, and community-driven
              initiatives, Collins envisions COLLTECH as a platform that not
              only provides products but also inspires{" "}
              <em>opportunities, growth, and empowerment</em>.
            </p>
          </motion.div>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-4 ring-[#00C2D1]/30">
              <Image
                src="/founder-collins.jpg"
                alt="Collins Otieno, Founder of COLLTECH - Tech & Office Supplies in Kenya"
                width={400}
                height={400}
                itemProp="image"
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-slate-50 text-gray-800 py-16">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl bg-white shadow-sm border-t-4 border-[#00C2D1]">
            <h2 className="text-2xl font-bold text-[#00C2D1] mb-3">Our Mission</h2>
            <p className="text-lg leading-relaxed text-slate-600">
              To make <strong>quality tech gadgets</strong> and{" "}
              <strong>office essentials</strong> accessible to every Kenyan,
              empowering individuals, students, and businesses with tools that
              enhance productivity, connectivity, and efficiency.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white shadow-sm border-t-4 border-[#7B2CBF]">
            <h2 className="text-2xl font-bold text-[#7B2CBF] mb-3">Our Vision</h2>
            <p className="text-lg leading-relaxed text-slate-600">
              To be the <strong>go-to destination</strong> for tech and office
              supplies in Kenya, recognized for our reliability, affordability,
              and outstanding customer experience.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-slate-900">
          Why Choose <span className="text-[#7B2CBF]">COLLTECH?</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reasons.map((item, idx) => (
            <div
              key={idx}
              className="bg-white text-gray-800 p-6 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
            >
              <span className="text-3xl" aria-hidden>{item.icon}</span>
              <h3 className="text-xl font-semibold text-slate-900 mt-3 mb-2">
                {item.title}
              </h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-[#00C2D1] to-[#7B2CBF] py-16 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the COLLTECH Family</h2>
          <p className="max-w-2xl mx-auto mb-6 text-lg text-gray-100">
            Whether you&apos;re shopping for personal use or looking to equip your
            business with the best tech & office essentials,{" "}
            <strong>COLLTECH</strong> is here to serve you.
          </p>
          <Link
            href="/"
            className="inline-block bg-yellow-300 text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 transition shadow-lg"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}