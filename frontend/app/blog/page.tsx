import BlogListClient from "./BlogListClient";
import { getPublishedBlogPosts } from "../lib/blogPosts";

export const revalidate = 3600;

export default function BlogPage() {
  const posts = getPublishedBlogPosts();
  return <BlogListClient posts={posts} />;
}
