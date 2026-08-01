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
  ResponsiveContainer,
} from 'recharts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z
  .object({
    currentAge: z.coerce.number().min(16).max(85),
    retirementAge: z.coerce.number().min(17).max(90),
    currentSavings: z.coerce.number().min(0).max(50_000_000),
    monthlyContribution: z.coerce.number().min(0).max(200_000),
    expectedReturn: z.coerce.number().min(0).max(20),
    safeWithdrawalRate: z.coerce.number().min(1).max(10),
  })
  .refine((v) => v.retirementAge > v.currentAge, {
    message: 'Retirement age must be after current age',
    path: ['retirementAge'],
  });

type FormValues = z.infer<typeof formSchema>;

function projectGrowth(
  currentSavings: number,
  monthlyContribution: number,
  years: number,
  expectedReturnPct: number,
) {
  const monthlyRate = expectedReturnPct / 100 / 12;
  const balances: { year: number; balance: number }[] = [
    { year: 0, balance: Math.round(currentSavings) },
  ];
  let balance = currentSavings;
  for (let year = 1; year <= years; year++) {
    for (let month = 0; month < 12; month++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
    }
    balances.push({ year, balance: Math.round(balance) });
  }
  return balances;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function RetirementSavingsCalculator() {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 15000,
      monthlyContribution: 500,
      expectedReturn: 7,
      safeWithdrawalRate: 4,
    },
  });

  const values = watch();

  const result = useMemo(() => {
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) return null;
    const v = parsed.data;
    const years = v.retirementAge - v.currentAge;

    const chartData = projectGrowth(
      v.currentSavings,
      v.monthlyContribution,
      years,
      v.expectedReturn,
    ).map((point) => ({
      ...point,
      age: v.currentAge + point.year,
    }));

    const endingBalance = chartData[chartData.length - 1].balance;
    const annualWithdrawal = (endingBalance * v.safeWithdrawalRate) / 100;
    const monthlyWithdrawal = annualWithdrawal / 12;
    const totalContributed =
      v.currentSavings + v.monthlyContribution * 12 * years;
    const totalGrowth = endingBalance - totalContributed;

    return {
      chartData,
      years,
      retirementAge: v.retirementAge,
      endingBalance,
      annualWithdrawal,
      monthlyWithdrawal,
      totalContributed,
      totalGrowth,
    };
  }, [values]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="currentAge">Current age</Label>
            <Input id="currentAge" type="number" step="1" {...register('currentAge')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="retirementAge">Target retirement age</Label>
            <Input
              id="retirementAge"
              type="number"
              step="1"
              {...register('retirementAge')}
            />
            {errors.retirementAge && (
              <p className="text-xs text-destructive">{errors.retirementAge.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentSavings">Current retirement savings</Label>
            <Input
              id="currentSavings"
              type="number"
              step="100"
              {...register('currentSavings')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyContribution">Monthly contribution</Label>
            <Input
              id="monthlyContribution"
              type="number"
              step="10"
              {...register('monthlyContribution')}
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
            <Label htmlFor="safeWithdrawalRate">Safe withdrawal rate (%/year)</Label>
            <Input
              id="safeWithdrawalRate"
              type="number"
              step="0.1"
              {...register('safeWithdrawalRate')}
            />
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                Projected growth to age {result.retirementAge} ({result.years} years)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="age"
                      tickFormatter={(age) => `Age ${age}`}
                      className="text-xs"
                    />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      width={90}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(age) => `Age ${age}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      name="Projected balance"
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
              <CardTitle>What this means at retirement</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Projected balance</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(result.endingBalance)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(result.totalContributed)} contributed,{' '}
                  {formatCurrency(result.totalGrowth)} from growth
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Sustainable withdrawal (at your safe withdrawal rate)
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(result.annualWithdrawal)}/year
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ≈ {formatCurrency(result.monthlyWithdrawal)}/month
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        This calculator is informational only, not personalized financial advice. It assumes a
        constant contribution and rate of return, which real markets never deliver evenly —
        treat the result as a directional estimate, not a guarantee, and revisit it as your
        situation changes.
      </p>
    </div>
  );
}
