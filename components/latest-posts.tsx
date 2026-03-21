import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BlogPostCard } from "./blog-post-card"
import { ArrowRight, BookOpen } from "lucide-react"

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

interface LatestPostsProps {
  posts: TransformedPost[]
}

export function LatestPosts({ posts: transformedPosts }: LatestPostsProps) {

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-background">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Latest Articles
          </h2>
        </div>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
          Stay up to date with our most recent publications. Fresh perspectives and insights delivered regularly.
        </p>
      </div>

      {transformedPosts.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {transformedPosts.map((post) => (
              <BlogPostCard key={post.id} {...post} slug={post.slug} analytics={post.analytics} />
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link href="/blog?sort=latest">
              <Button variant="outline" size="lg" className="group">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12 rounded-xl border border-border bg-card">
          <p className="text-muted-foreground">More articles coming soon. Check back later!</p>
        </div>
      )}
    </section>
  )
}
