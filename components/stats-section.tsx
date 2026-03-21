import { Users, BookOpen, TrendingUp, Heart } from "lucide-react"

interface Stat {
  icon: React.ReactNode
  value: string
  label: string
  description: string
}

interface StatsSectionProps {
  postCount: number
}

export function StatsSection({ postCount }: StatsSectionProps) {
  const stats: Stat[] = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      value: postCount.toString(),
      label: "Published Articles",
      description: "In-depth articles covering diverse topics"
    },
    {
      icon: <Users className="h-8 w-8" />,
      value: "10K+",
      label: "Monthly Readers",
      description: "Engaged community of curious minds"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      value: "95%",
      label: "Reader Satisfaction",
      description: "Content that resonates with our audience"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      value: "4.9",
      label: "Average Rating",
      description: "Quality content you can trust"
    }
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-br from-muted/30 via-muted/20 to-background">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex justify-center mb-4 text-primary">
              {stat.icon}
            </div>
            <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              {stat.value}
            </div>
            <div className="text-lg font-semibold text-foreground mb-1">
              {stat.label}
            </div>
            <div className="text-sm text-muted-foreground">
              {stat.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

