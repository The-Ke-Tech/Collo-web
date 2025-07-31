'use client';
import PageLayout from '@/components/page-layout';
import { useState } from 'react';
import { FiChevronDown } from "react-icons/fi";

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Browse our categories, add items to your cart, and checkout using M-Pesa or your preferred payment method.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Orders are delivered within 1-3 working days in major cities and up to 5 days for remote areas.",
  },
  {
    question: "Can I cancel or modify my order?",
    answer:
      "Yes, as long as the order has not been processed or has not been shipped. Contact our support team for assistance.",
  },
  {
    question: "What payment methods do you support?",
    answer:
      "We support M-Pesa, debit/credit cards, and selected mobile banking options for convenience.",
  },
  {
    question: "Do you offer returns or refunds?",
    answer:
      "Yes, items can be returned within 7 days if they meet our return policy. Refunds are processed within 3–5 working days.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageLayout title="Frequently Asked Questions">
      <div className="bg-gradient-to-b from-gray-900 via-black to-gray-900 min-h-screen text-gray-200 px-4 py-8 rounded-xl shadow-lg">
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
                  className={`transform transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
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
