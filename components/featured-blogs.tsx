import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BlogPostCard } from "./blog-post-card"
import { ArrowRight, Sparkles } from "lucide-react"

interface TransformedPost {
  id: number
  slug: string
  title: string
  category: string
  image: string
  author: {
    name: string
    avatar: string
    bio: string
  }
  date: string
  readTime: string
  excerpt: string
  tags: string[]
  analytics?: { views: number; likes: number }
}

interface FeaturedBlogsProps {
  posts: TransformedPost[]
}

export function FeaturedBlogs({ posts: transformedPosts }: FeaturedBlogsProps) {
  if (transformedPosts.length === 0) {
    return null
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-white dark:bg-slate-950">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Featured Stories
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
          Handpicked articles that offer deep insights, practical advice, and thought-provoking perspectives
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {transformedPosts.map((post) => (
          <BlogPostCard key={post.id} {...post} slug={post.slug} analytics={post.analytics} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/blog?sort=featured">
          <Button variant="outline" size="lg" className="group">
            View All Articles
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </section>
  )
}

