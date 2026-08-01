'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  transactionsPerDay: z.coerce.number().min(0).max(50),
  avgRoundUp: z.coerce.number().min(0).max(5),
  multiplier: z.coerce.number().min(1).max(10),
  expectedReturn: z.coerce.number().min(0).max(20),
  years: z.coerce.number().min(1).max(30),
});

type FormValues = z.infer<typeof formSchema>;

function projectRoundUps(
  transactionsPerDay: number,
  avgRoundUp: number,
  multiplier: number,
  expectedReturnPct: number,
  years: number,
) {
  const monthlyBase = transactionsPerDay * avgRoundUp * 30;
  const monthlyRate = expectedReturnPct / 100 / 12;

  let balance1x = 0;
  let balanceMultiplier = 0;
  const series: { year: number; base: number; withMultiplier: number }[] = [
    { year: 0, base: 0, withMultiplier: 0 },
  ];

  for (let year = 1; year <= years; year++) {
    for (let month = 0; month < 12; month++) {
      balance1x = balance1x * (1 + monthlyRate) + monthlyBase;
      balanceMultiplier =
        balanceMultiplier * (1 + monthlyRate) + monthlyBase * multiplier;
    }
    series.push({
      year,
      base: Math.round(balance1x),
      withMultiplier: Math.round(balanceMultiplier),
    });
  }

  return { series, monthlyBase, monthlyWithMultiplier: monthlyBase * multiplier };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function RoundUpInvestingEstimator() {
  const { register, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      transactionsPerDay: 3,
      avgRoundUp: 0.5,
      multiplier: 2,
      expectedReturn: 7,
      years: 10,
    },
  });

  const values = watch();

  const result = useMemo(() => {
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) return null;
    const v = parsed.data;
    const { series, monthlyBase, monthlyWithMultiplier } = projectRoundUps(
      v.transactionsPerDay,
      v.avgRoundUp,
      v.multiplier,
      v.expectedReturn,
      v.years,
    );
    const last = series[series.length - 1];
    return { series, last, monthlyBase, monthlyWithMultiplier, years: v.years, multiplier: v.multiplier };
  }, [values]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="transactionsPerDay">Card transactions per day</Label>
            <Input
              id="transactionsPerDay"
              type="number"
              step="1"
              {...register('transactionsPerDay')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avgRoundUp">Average round-up per transaction ($)</Label>
            <Input
              id="avgRoundUp"
              type="number"
              step="0.05"
              {...register('avgRoundUp')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="multiplier">Round-up multiplier (e.g. 2x, 3x)</Label>
            <Input
              id="multiplier"
              type="number"
              step="1"
              {...register('multiplier')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedReturn">Expected annual return (%)</Label>
            <Input
              id="expectedReturn"
              type="number"
              step="0.1"
              {...register('expectedReturn')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Years to project</Label>
            <Input id="years" type="number" step="1" {...register('years')} />
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Projected growth over {result.years} years</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.series}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="year"
                      tickFormatter={(year) => `Yr ${year}`}
                      className="text-xs"
                    />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      width={90}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(year) => `Year ${year}`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="base"
                      name="Round-ups only (1x)"
                      stroke="var(--chart-3)"
                      fill="var(--chart-3)"
                      fillOpacity={0.15}
                    />
                    <Area
                      type="monotone"
                      dataKey="withMultiplier"
                      name={`With your ${result.multiplier}x multiplier`}
                      stroke="var(--chart-1)"
                      fill="var(--chart-1)"
                      fillOpacity={0.15}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What spare change adds up to</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  Monthly round-ups invested (before multiplier)
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(result.monthlyBase)}/month
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Projected balance after {result.years} years (with {result.multiplier}x)
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(result.last.withMultiplier)}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        This calculator is informational only, not personalized financial advice. It
        assumes a constant transaction pattern and rate of return — real spending and
        markets vary. Round-up investing works best as an addition to, not a
        replacement for, a regular contribution plan.
      </p>
    </div>
  );
}
