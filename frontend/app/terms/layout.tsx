import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | CVboosta",
  description:
    "Review the CVboosta terms and conditions for using the platform and paid plans.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
