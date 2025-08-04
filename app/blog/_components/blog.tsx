"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface BlogContentProps {
  posts: {
    title: string;
    excerpt: string;
    image: string;
    slug: string;
    category: string;
    date: string;
  }[];
}

export default function BlogContent({ posts }: BlogContentProps) {
  return (
    <section className="bg-gradient-to-b from-[#00C2D1] via-[#4B3F72] to-[#7B2CBF] min-h-screen text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold mb-4"
        >
          Insights, Tips & <span className="text-yellow-300">Trends</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-100"
        >
          Explore the COLLTECH Blog — your ultimate hub for{" "}
          <strong>tech insights</strong>, <strong>product reviews</strong>, and{" "}
          <strong>smart office hacks</strong> tailored for the Kenyan market.
        </motion.p>
      </div>

      {/* Blog Grid */}
      <div className="bg-white text-gray-800 py-16">
        <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((post, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: idx * 0.2, type: "spring" }}
              viewport={{ once: true, amount: 0.2 }}
              className="rounded-2xl shadow-lg hover:shadow-2xl transition bg-gradient-to-br from-white to-gray-50 border overflow-hidden"
            >
              <div className="relative w-full h-56">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <span className="text-xs uppercase tracking-wide text-[#7B2CBF] font-bold">
                  {post.category}
                </span>
                <h2 className="mt-2 text-2xl font-bold text-[#00C2D1] hover:text-[#7B2CBF] transition">
                  <Link href={post.slug}>{post.title}</Link>
                </h2>
                <p className="mt-3 text-gray-600">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {new Date(post.date).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <Link
                    href={post.slug}
                    className="text-[#7B2CBF] font-semibold hover:underline"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
