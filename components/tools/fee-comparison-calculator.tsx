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

/**
 * Default advisory fees, read off each provider's own published pricing page.
 * `pricingUrl` is surfaced in the UI so a reader can check the figure at source
 * rather than taking ours on trust — and so we can re-verify it quarterly.
 * Update FEE_DATA_VERIFIED in lib/site-config.ts whenever these change.
 */
const PLATFORMS = [
  {
    key: 'betterment',
    name: 'Betterment',
    defaultFee: 0.25,
    color: 'var(--chart-2)',
    pricingUrl: 'https://www.betterment.com/pricing',
  },
  {
    key: 'wealthfront',
    name: 'Wealthfront',
    defaultFee: 0.25,
    color: 'var(--chart-3)',
    pricingUrl: 'https://www.wealthfront.com/pricing',
  },
  {
    key: 'schwab',
    name: 'Schwab Intelligent Portfolios',
    defaultFee: 0,
    color: 'var(--chart-1)',
    pricingUrl:
      'https://www.schwab.com/intelligent-portfolios/what-you-get-and-what-you-pay',
  },
] as const;

const formSchema = z.object({
  startingBalance: z.coerce.number().min(0).max(10_000_000),
  annualContribution: z.coerce.number().min(0).max(1_000_000),
  years: z.coerce.number().min(1).max(40),
  expectedReturn: z.coerce.number().min(0).max(20),
  betterment: z.coerce.number().min(0).max(3),
  wealthfront: z.coerce.number().min(0).max(3),
  schwab: z.coerce.number().min(0).max(3),
});

type FormValues = z.infer<typeof formSchema>;

function projectBalances(
  startingBalance: number,
  annualContribution: number,
  years: number,
  expectedReturnPct: number,
  feePct: number,
): number[] {
  const netReturn = (expectedReturnPct - feePct) / 100;
  const balances: number[] = [Math.round(startingBalance)];
  let balance = startingBalance;
  for (let year = 1; year <= years; year++) {
    balance = balance * (1 + netReturn) + annualContribution;
    balances.push(Math.round(balance));
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

export function FeeComparisonCalculator() {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      startingBalance: 25000,
      annualContribution: 6000,
      years: 20,
      expectedReturn: 7,
      betterment: PLATFORMS[0].defaultFee,
      wealthfront: PLATFORMS[1].defaultFee,
      schwab: PLATFORMS[2].defaultFee,
    },
  });

  const values = watch();

  const result = useMemo(() => {
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) return null;
    const v = parsed.data;

    const series = PLATFORMS.map((p) => ({
      ...p,
      feeRate: v[p.key],
      balances: projectBalances(
        v.startingBalance,
        v.annualContribution,
        v.years,
        v.expectedReturn,
        v[p.key],
      ),
    }));

    const chartData = Array.from({ length: v.years + 1 }, (_, year) => {
      const row: Record<string, number> = { year };
      series.forEach((s) => {
        row[s.key] = s.balances[year];
      });
      return row;
    });

    const ending = series.map((s) => ({
      key: s.key,
      name: s.name,
      color: s.color,
      feeRate: s.feeRate,
      endingBalance: s.balances[v.years],
    }));

    const bestBalance = Math.max(...ending.map((e) => e.endingBalance));
    const worst = ending.reduce((worst, e) =>
      e.endingBalance < worst.endingBalance ? e : worst,
    );
    const feeCostGap = bestBalance - worst.endingBalance;

    return { chartData, ending, worst, feeCostGap, years: v.years };
  }, [values]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startingBalance">Starting balance</Label>
            <Input
              id="startingBalance"
              type="number"
              step="100"
              {...register('startingBalance')}
            />
            {errors.startingBalance && (
              <p className="text-xs text-destructive">Enter a valid balance</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualContribution">Annual contribution</Label>
            <Input
              id="annualContribution"
              type="number"
              step="100"
              {...register('annualContribution')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Years invested</Label>
            <Input id="years" type="number" step="1" {...register('years')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedReturn">Expected annual return (%, before fees)</Label>
            <Input
              id="expectedReturn"
              type="number"
              step="0.1"
              {...register('expectedReturn')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform management fees (% of AUM, annual)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          {PLATFORMS.map((platform) => (
            <div key={platform.key} className="space-y-2">
              <Label htmlFor={platform.key} className='flex items-center gap-2'>
                {platform.name}
                <a
                  href={platform.pricingUrl}
                  target='_blank'
                  rel='noopener noreferrer nofollow'
                  className='text-xs font-normal text-primary hover:underline'>
                  official pricing
                </a>
              </Label>
              <Input
                id={platform.key}
                type="number"
                step="0.01"
                {...register(platform.key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Projected balance over {result.years} years</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.chartData}>
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
                    {PLATFORMS.map((platform) => (
                      <Area
                        key={platform.key}
                        type="monotone"
                        dataKey={platform.key}
                        name={platform.name}
                        stroke={platform.color}
                        fill={platform.color}
                        fillOpacity={0.12}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What fees actually cost you</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Platform</th>
                      <th className="py-2 pr-4 font-medium">Fee rate</th>
                      <th className="py-2 font-medium">Ending balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.ending.map((row) => (
                      <tr key={row.key} className="border-b border-border last:border-0">
                        <td className="py-2 pr-4">{row.name}</td>
                        <td className="py-2 pr-4">{row.feeRate.toFixed(2)}%</td>
                        <td className="py-2 font-medium">
                          {formatCurrency(row.endingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.feeCostGap > 0 && (
                <p className="text-sm text-muted-foreground">
                  Over {result.years} years, the fee gap between the platforms above works
                  out to <strong className="text-foreground">{formatCurrency(result.feeCostGap)}</strong> in
                  lost ending balance for {result.worst.name} at a {result.worst.feeRate.toFixed(2)}%
                  fee, all else being equal.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        This calculator is informational only, not personalized financial advice. It assumes a
        constant annual return and fee rate for simplicity — actual returns vary year to year.
        Fee rates and account minimums change; verify current terms directly with each provider
        before deciding.
      </p>
    </div>
  );
}
