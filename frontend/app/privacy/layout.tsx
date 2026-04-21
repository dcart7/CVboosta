import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CVboosta",
  description:
    "Read how CVboosta handles your personal data, CV files, and security practices.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
