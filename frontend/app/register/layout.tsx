import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | CVboosta",
  description: "Create your CVboosta account and start optimizing your CV.",
  alternates: {
    canonical: "/register",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
