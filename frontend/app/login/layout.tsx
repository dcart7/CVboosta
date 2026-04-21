import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In | CVboosta",
  description: "Sign in to your CVboosta account.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
