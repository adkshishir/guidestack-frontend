"use client"

import { BookOpen, Sparkles, TrendingUp, Users, Shield, Zap } from "lucide-react"

const features = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "In-Depth Comparisons",
    description: "Side-by-side breakdowns of fees, minimums, and features across major robo-advisors — not just marketing claims."
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "How the Algorithms Work",
    description: "We explain the mechanics behind rebalancing, tax-loss harvesting, and portfolio construction in plain English."
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Calculators With Your Numbers",
    description: "Run the math with your own income, balance, and timeline — not a generic sample portfolio."
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Alternatives, Not Just Picks",
    description: "We cover DIY and hybrid options alongside robo-advisors so you can weigh every path."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Independent & Unbiased",
    description: "We verify claims against provider documentation and disclosures before publishing."
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Kept Current",
    description: "Fees, features, and minimums shift often — we keep our research up to date."
  }
]

export function WhyReadSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-linear-to-b from-white to-muted/20 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Why Trust Our Research?
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Independent research on robo-advisors and automated investing. Here's what makes it different.
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

