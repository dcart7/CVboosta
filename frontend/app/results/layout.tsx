import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Results | CVboosta",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
