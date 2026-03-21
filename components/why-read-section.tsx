"use client"

import { BookOpen, Sparkles, TrendingUp, Users, Shield, Zap } from "lucide-react"

const features = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Quality Content",
    description: "Every article is carefully crafted to provide value, insights, and actionable information."
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Diverse Topics",
    description: "From technology to culture, we cover a wide range of subjects that matter to you."
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Stay Ahead",
    description: "Get early insights into trends, innovations, and developments shaping our world."
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Community Driven",
    description: "Join a community of curious minds sharing knowledge and perspectives."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Trusted Sources",
    description: "We verify facts and cite reliable sources to ensure accuracy and credibility."
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Regular Updates",
    description: "Fresh content published regularly to keep you informed and engaged."
  }
]

export function WhyReadSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-linear-to-b from-white to-muted/20 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Why Read Our Blog?
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          We're committed to delivering content that informs, inspires, and engages. Here's what makes us different.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-6 rounded-xl border border-border bg-card hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary shrink-0">
                {feature.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                {feature.title}
              </h3>
            </div>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

