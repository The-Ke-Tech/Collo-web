import PageLayout from "@/components/page-layout";

export default function Returns() {
  return (
    <PageLayout title="Returns & Refunds Policy">
      <p>We want you to love your purchase. If you&apos;re not satisfied, here&apos;s how returns work:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>Returns are accepted within <strong>7 days</strong> of delivery for eligible products.</li>
        <li>Items must be unused, in original packaging, and with proof of purchase.</li>
        <li>Refunds are processed within <strong>5-7 working days</strong> after we receive the item.</li>
      </ul>
      <p className="mt-4">For full details, contact our support team.</p>
    </PageLayout>
  );
}
