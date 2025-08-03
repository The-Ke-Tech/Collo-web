import PageLayout from "@/components/page-layout";

export default function Support() {
  return (
    <PageLayout title="Help & Support">
      <p>Need assistance? Our team is here to help.</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Check out our <a href="/faq" className="text-blue-400 hover:underline">FAQs</a> for quick answers.</li>
        <li>Email us at <span className="font-semibold">coltechaccessories@gmail.com</span>.</li>
        <li>Call us at <span className="font-semibold">+254 728619730</span> (Mon–Sat, 8am–6pm).</li>
        <li>Chat with us via live support (coming soon!).</li>
      </ul>
    </PageLayout>
  );
}
