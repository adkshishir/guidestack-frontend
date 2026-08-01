'use client';

import {
  AreaChart,
  Area,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardAnalytics } from '@/lib/api/dashboard';

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: 'hsl(142, 76%, 36%)',
  DRAFT: 'hsl(38, 92%, 50%)',
  REVIEW: 'hsl(221, 83%, 53%)',
  ARCHIVED: 'hsl(0, 0%, 45%)',
};

const CHART_COLORS = ['hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)'];

export function DashboardCharts({
  data,
  chartDays,
  setChartDays,
}: {
  data: DashboardAnalytics;
  chartDays: number;
  setChartDays: (d: number) => void;
}) {
  return (
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
              <AreaChart data={data.postsOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} contentStyle={{ borderRadius: 8 }} />
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
                    <Cell
                      key={index}
                      fill={STATUS_COLORS[data.postsByStatus[index].status] ?? CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
