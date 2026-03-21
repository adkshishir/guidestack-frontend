export interface BlogPost {
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
  content: string
  excerpt: string
  tags: string[]
}

export const allBlogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "impact-technology-workplace",
    title: "The Impact of Technology on the Workplace: How Technology is Changing",
    category: "Technology",
    image: "/beach-aerial-view.jpg",
    author: {
      name: "Tracey Wilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tracey",
      bio: "Technology enthusiast and workplace innovation expert with over 10 years of experience.",
    },
    date: "August 20, 2022",
    readTime: "8 min read",
    excerpt: "Explore how modern technology is transforming workplaces and what it means for the future of work.",
    content: `
      <h2>Introduction</h2>
      <p>Technology has become an integral part of modern workplaces, fundamentally changing how we work, collaborate, and innovate. In this comprehensive article, we'll explore the various ways technology is shaping the future of work.</p>

      <h2>Remote Work Revolution</h2>
      <p>The rise of remote work technology has broken geographical barriers. Tools like video conferencing, project management platforms, and cloud-based collaboration have made it possible for teams to work effectively from anywhere in the world.</p>

      <h2>Automation and AI</h2>
      <p>Artificial intelligence and automation are streamlining repetitive tasks, allowing employees to focus on more strategic and creative work. From chatbots handling customer service to AI-powered analytics, the technology landscape is evolving rapidly.</p>

      <h2>Enhanced Communication</h2>
      <p>Modern communication tools have revolutionized internal and external interactions. Real-time messaging, video calls, and collaborative documents enable seamless information flow across organizations.</p>

      <h2>Data Security and Privacy</h2>
      <p>With the increase in digital operations, companies are investing heavily in cybersecurity solutions to protect sensitive data and ensure workplace security.</p>

      <h2>The Future of Work</h2>
      <p>As technology continues to evolve, we can expect even more transformative changes in the workplace. Organizations that embrace these changes and invest in employee training will likely lead their industries.</p>

      <h2>Conclusion</h2>
      <p>Technology is not just a tool; it's a fundamental driver of workplace transformation. By understanding and adapting to these changes, businesses can unlock new opportunities for growth and innovation.</p>
    `,
    tags: ["Technology", "Workplace", "Innovation", "Future of Work"],
  },
  {
    id: 2,
    slug: "digital-transformation-guide",
    title: "Digital Transformation Guide: Moving Your Business Forward",
    category: "Technology",
    image: "/venice-italy-basilica.jpg",
    author: {
      name: "Jason Francisco",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jason",
      bio: "Digital strategist helping businesses navigate the digital landscape.",
    },
    date: "August 20, 2022",
    readTime: "10 min read",
    excerpt: "A practical guide to implementing digital transformation in your organization.",
    content: `
      <h2>What is Digital Transformation?</h2>
      <p>Digital transformation is the process of integrating digital technology into all areas of your business. It's about changing how you operate and deliver value to customers.</p>

      <h2>Key Components</h2>
      <p>Successful digital transformation involves technology, people, and processes. Each component is equally important in achieving your transformation goals.</p>

      <h2>Implementation Strategy</h2>
      <p>Start with a clear vision and strategy. Assess your current state, identify gaps, and create a roadmap for implementation. Remember that transformation is a journey, not a destination.</p>

      <h2>Overcoming Challenges</h2>
      <p>Common challenges include resistance to change, skills gaps, and integration issues. Address these proactively through proper training and change management.</p>

      <h2>Measuring Success</h2>
      <p>Define clear KPIs and metrics to track your transformation progress. Regular monitoring helps you stay on course and make necessary adjustments.</p>

      <h2>Conclusion</h2>
      <p>Digital transformation is essential for staying competitive. By following a structured approach and maintaining commitment, your organization can successfully navigate this journey.</p>
    `,
    tags: ["Digital", "Transformation", "Strategy", "Business"],
  },
]

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return allBlogPosts.find((post) => post.slug === slug)
}

export function getRelatedPosts(currentPostId: number, limit = 3): BlogPost[] {
  return allBlogPosts.filter((post) => post.id !== currentPostId).slice(0, limit)
}
