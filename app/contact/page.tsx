'use client';
import PageLayout from "@/components/page-layout";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setForm({ name: "", email: "", message: "" });
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Contact Us">
      <p className="text-gray-300">
        We'd love to hear from you. Fill out the form below or reach us via email or phone.
      </p>
      <form onSubmit={handleSubmit} className="grid gap-4 mt-6">
        <input
          type="text"
          placeholder="Your Name"
          className="p-3 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          className="p-3 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <textarea
          placeholder="Your Message"
          className="p-3 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        ></textarea>
        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </PageLayout>
  );
}
