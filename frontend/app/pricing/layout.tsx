import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | CVboosta",
  description:
    "Compare CVboosta plans for resume analysis and vacancy-aligned drafting: Single, Go, Pro, or Lifetime.",
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
