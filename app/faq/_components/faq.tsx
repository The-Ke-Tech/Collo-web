"use client";
import { useState } from "react";
import PageLayout from "@/components/page-layout";
import { FiChevronDown } from "react-icons/fi";

type FAQ = { question: string; answer: string };

export default function FAQClient({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageLayout title="Frequently Asked Questions">
      <div className="bg-gradient-to-b from-gray-900 via-black to-gray-900 min-h-screen text-gray-200 px-4 py-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Frequently Asked Questions (FAQs)
        </h1>
        <p className="text-lg text-gray-300 mb-8 text-center max-w-3xl mx-auto">
          Need help? Find answers to common questions below. Still unsure?{" "}
          <a href="/contact" className="text-blue-400 hover:underline">
            Contact our support team
          </a>
          .
        </p>
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg shadow-md border border-gray-700 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center px-6 py-4 text-left text-lg font-semibold text-blue-400 hover:text-blue-300"
              >
                {faq.question}
                <FiChevronDown
                  className={`transform transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-300 border-t border-gray-700">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
