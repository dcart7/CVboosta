import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Optimize | CVboosta",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OptimizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
