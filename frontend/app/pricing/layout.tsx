import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | CVboosta",
  description:
    "Choose a CVboosta plan: single scan, Go, Pro, or Lifetime. Improve ATS match and application clarity faster.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
