import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History | CVboosta",
  robots: {
    index: false,
    follow: false,
  },
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
