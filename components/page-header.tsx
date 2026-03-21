import Link from "next/link"

interface PageHeaderProps {
  title: string
  breadcrumbs?: { label: string; href: string }[]
}

export function PageHeader({ title, breadcrumbs = [] }: PageHeaderProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="mb-4 flex flex-wrap gap-2 text-sm" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                <Link href={crumb.href} className="text-primary hover:text-primary/80 transition-colors">
                  {crumb.label}
                </Link>
                {index < breadcrumbs.length - 1 && <span className="text-slate-400 dark:text-slate-500">/</span>}
              </div>
            ))}
          </nav>
        )}
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{title}</h1>
      </div>
    </div>
  )
}
