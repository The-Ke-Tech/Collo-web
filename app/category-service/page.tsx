import { Metadata } from "next";
import CategoryServiceClient from "./_components/category-client";


export const metadata: Metadata = {
  title: "Services by Category | COLLTECH",
  description:
    "Browse COLLTECH services by category. Printing, internet, design, gaming and digital services in Kenya.",
};

export default function CategoryServicePage() {
  return <CategoryServiceClient />;
}
