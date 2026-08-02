import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | CVboosta",
  description: "Create a new CVboosta password from your secure reset link.",
  alternates: {
    canonical: "/reset-password",
  },
  robots: {
    index: false,
    follow: false,
  },
  referrer: "no-referrer",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
