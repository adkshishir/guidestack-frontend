'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ProtectedRoute } from '@/components/admin/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { dashboardApi, DashboardAnalytics } from '@/lib/api/dashboard';
import {
  FileText,
  Users,
  MessageSquare,
  FolderTree,
  Mail,
  Eye,
  Heart,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: 'hsl(142, 76%, 36%)',
  DRAFT: 'hsl(38, 92%, 50%)',
  REVIEW: 'hsl(221, 83%, 53%)',
  ARCHIVED: 'hsl(0, 0%, 45%)',
};

const CHART_COLORS = ['hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)'];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartDays, setChartDays] = useState(30);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    dashboardApi
      .getAnalytics(chartDays)
      .then((res) => {
        if (cancelled) return;
        if (res.error) {
          setError(res.error.message || 'Failed to load analytics');
          return;
        }
        if (res.data) setData(res.data);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load analytics');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [chartDays]);

  if (loading && !data) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email}. Here’s what’s happening with your content.
          </p>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  dashboardApi.getAnalytics(chartDays).then((res) => {
                    if (res.data) setData(res.data);
                    if (res.error) setError(res.error.message || 'Failed to load');
                    setLoading(false);
                  });
                }}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {data && (
          <>
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/admin/blog">
                <Card className="transition-colors hover:border-primary/50 hover:bg-muted/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.counts.blogPosts}</div>
                    <p className="text-xs text-muted-foreground">
                      {data.counts.publishedPosts} published · {data.counts.draftPosts} drafts
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/users">
                <Card className="transition-colors hover:border-primary/50 hover:bg-muted/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.counts.users}</div>
                    <p className="text-xs text-muted-foreground">Team members</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/admin/comments">
                <Card className="transition-colors hover:border-primary/50 hover:bg-muted/30">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Comments</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.counts.comments}</div>
                    <p className="text-xs text-muted-foreground">Total comments</p>
                  </CardContent>
                </Card>
              </Link>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxonomy</CardTitle>
                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.counts.categories} / {data.counts.tags}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Link href="/admin/categories" className="text-primary hover:underline">Categories</Link>
                    {' · '}
                    <Link href="/admin/tags" className="text-primary hover:underline">Tags</Link>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Engagement row */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">{data.engagement.totalViews}</span>
                      <span className="text-sm text-muted-foreground">views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-destructive" />
                      <span className="text-2xl font-bold">{data.engagement.totalLikes}</span>
                      <span className="text-sm text-muted-foreground">likes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Newsletter</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.counts.subscribers}</div>
                  <p className="text-xs text-muted-foreground">Subscribers</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>Posts over time</CardTitle>
                    <CardDescription>Created and published in the last {chartDays} days</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    {[7, 30, 90].map((d) => (
                      <Button
                        key={d}
                        variant={chartDays === d ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setChartDays(d)}
                      >
                        {d}d
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-70 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data.postsOverTime}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorPublished" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip
                          labelFormatter={(v) => new Date(v).toLocaleDateString()}
                          contentStyle={{ borderRadius: 8 }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="count"
                          name="Total created"
                          stroke="hsl(var(--primary))"
                          fillOpacity={1}
                          fill="url(#colorTotal)"
                        />
                        <Area
                          type="monotone"
                          dataKey="published"
                          name="Published"
                          stroke="hsl(142, 76%, 36%)"
                          fillOpacity={1}
                          fill="url(#colorPublished)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Posts by status</CardTitle>
                  <CardDescription>Distribution of blog post statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-70 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.postsByStatus}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={({ status, count }) => `${status}: ${count}`}
                        >
                          {data.postsByStatus.map((_, index) => (
                            <Cell key={index} fill={STATUS_COLORS[data.postsByStatus[index].status] ?? CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top posts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Top posts by views
                  </CardTitle>
                  <CardDescription>Most viewed articles</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.engagement.topPostsByViews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No view data yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {data.engagement.topPostsByViews.map((p, i) => (
                        <li key={p.id} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground w-6">{i + 1}.</span>
                          <Link
                            href={`/blog/${p.slug}`}
                            className="min-w-0 flex-1 truncate font-medium text-primary hover:underline"
                          >
                            {p.title}
                          </Link>
                          <span className="text-sm font-semibold tabular-nums">{p.views}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Top posts by likes
                  </CardTitle>
                  <CardDescription>Most liked articles</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.engagement.topPostsByLikes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No like data yet.</p>
                  ) : (
                    <ul className="space-y-3">
                      {data.engagement.topPostsByLikes.map((p, i) => (
                        <li key={p.id} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground w-6">{i + 1}.</span>
                          <Link
                            href={`/blog/${p.slug}`}
                            className="min-w-0 flex-1 truncate font-medium text-primary hover:underline"
                          >
                            {p.title}
                          </Link>
                          <span className="text-sm font-semibold tabular-nums">{p.likes}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
