import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, isPostPublished } from "../../lib/blogPosts";

type BlogPostLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: Omit<BlogPostLayoutProps, "children">): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post || !isPostPublished(post)) {
    notFound();
  }

  return {
    title: `${post.title} | CVboosta Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostLayout({ children, params }: BlogPostLayoutProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post || !isPostPublished(post)) {
    notFound();
  }

  return children;
}
