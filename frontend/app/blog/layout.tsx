import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV & ATS Blog | CVboosta",
  description:
    "Actionable guides on ATS optimization, resume keywords, and tailoring your CV to job descriptions.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

