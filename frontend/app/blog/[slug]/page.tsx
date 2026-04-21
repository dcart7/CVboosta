import { notFound } from "next/navigation";
import BlogPostClient from "./BlogPostClient";
import { getBlogPostBySlug, isPostPublished } from "../../lib/blogPosts";

export const revalidate = 3600;

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post || !isPostPublished(post)) {
    notFound();
  }

  return <BlogPostClient post={post} />;
}
