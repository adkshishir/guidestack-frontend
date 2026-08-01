'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  LineChart,
  Line,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Scenario = 'steady' | 'volatile' | 'downturn-recovery';

const SCENARIOS: { value: Scenario; label: string; description: string }[] = [
  {
    value: 'steady',
    label: 'Steady growth',
    description: 'The same return every month — the textbook case where lump sum wins.',
  },
  {
    value: 'volatile',
    label: 'Choppy / volatile',
    description: 'Returns swing up and down month to month around the same average.',
  },
  {
    value: 'downturn-recovery',
    label: 'Downturn, then recovery',
    description: 'A rough first third followed by a stronger recovery — the case DCA is meant for.',
  },
];

const formSchema = z.object({
  totalAmount: z.coerce.number().min(0).max(10_000_000),
  horizonMonths: z.coerce.number().min(3).max(36),
  annualReturn: z.coerce.number().min(-20).max(30),
});

type FormValues = z.infer<typeof formSchema>;

function buildMonthlyReturns(
  scenario: Scenario,
  months: number,
  annualReturnPct: number,
): number[] {
  const monthlyRate = annualReturnPct / 100 / 12;

  if (scenario === 'steady') {
    return Array.from({ length: months }, () => monthlyRate);
  }

  if (scenario === 'volatile') {
    const amplitude = Math.abs(monthlyRate) * 3 + 0.02;
    return Array.from(
      { length: months },
      (_, i) => monthlyRate + amplitude * Math.sin((i / 2) * Math.PI),
    );
  }

  // downturn-recovery: rough first third, calibrated recovery for the rest
  const dipMonths = Math.max(1, Math.floor(months / 3));
  const dipRate = monthlyRate - 0.04;
  const recoveryMonths = months - dipMonths;
  const recoveryRate =
    recoveryMonths > 0
      ? monthlyRate + (dipMonths * (monthlyRate - dipRate)) / recoveryMonths
      : monthlyRate;
  return Array.from({ length: months }, (_, i) =>
    i < dipMonths ? dipRate : recoveryRate,
  );
}

function simulateLumpSum(total: number, returns: number[]) {
  let balance = total;
  const series = [{ month: 0, lumpSum: Math.round(balance) }];
  returns.forEach((r, i) => {
    balance = balance * (1 + r);
    series.push({ month: i + 1, lumpSum: Math.round(balance) });
  });
  return series;
}

function simulateDca(total: number, returns: number[]) {
  const months = returns.length;
  const monthlyAmount = total / months;
  let balance = 0;
  const series = [{ month: 0, dca: 0 }];
  for (let i = 0; i < months; i++) {
    balance += monthlyAmount;
    balance = balance * (1 + returns[i]);
    series.push({ month: i + 1, dca: Math.round(balance) });
  }
  return series;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function DcaVsLumpSumSimulator() {
  const [scenario, setScenario] = useState<Scenario>('downturn-recovery');
  const { register, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      totalAmount: 10000,
      horizonMonths: 12,
      annualReturn: 7,
    },
  });

  const values = watch();

  const result = useMemo(() => {
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) return null;
    const v = parsed.data;

    const returns = buildMonthlyReturns(scenario, v.horizonMonths, v.annualReturn);
    const lumpSeries = simulateLumpSum(v.totalAmount, returns);
    const dcaSeries = simulateDca(v.totalAmount, returns);

    const chartData = lumpSeries.map((point, i) => ({
      month: point.month,
      lumpSum: point.lumpSum,
      dca: dcaSeries[i].dca,
    }));

    const finalLumpSum = lumpSeries[lumpSeries.length - 1].lumpSum;
    const finalDca = dcaSeries[dcaSeries.length - 1].dca;
    const gap = finalLumpSum - finalDca;

    return { chartData, finalLumpSum, finalDca, gap, months: v.horizonMonths };
  }, [values, scenario]);

  const activeScenario = SCENARIOS.find((s) => s.value === scenario)!;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total amount to invest</Label>
            <Input
              id="totalAmount"
              type="number"
              step="500"
              {...register('totalAmount')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horizonMonths">Investing horizon (months)</Label>
            <Input
              id="horizonMonths"
              type="number"
              step="1"
              {...register('horizonMonths')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualReturn">Average annual return (%)</Label>
            <Input
              id="annualReturn"
              type="number"
              step="0.5"
              {...register('annualReturn')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Market scenario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={scenario} onValueChange={(v) => setScenario(v as Scenario)}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCENARIOS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{activeScenario.description}</p>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Balance over {result.months} months</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(m) => `Mo ${m}`}
                      className="text-xs"
                    />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      width={90}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(m) => `Month ${m}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="lumpSum"
                      name="Lump sum"
                      stroke="var(--chart-2)"
                      dot={false}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="dca"
                      name="Dollar-cost averaging"
                      stroke="var(--chart-1)"
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Result under this scenario</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Lump sum ending balance</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(result.finalLumpSum)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">DCA ending balance</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(result.finalDca)}
                </p>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {result.gap >= 0
                  ? `Lump sum came out ahead by ${formatCurrency(result.gap)} in this scenario.`
                  : `Dollar-cost averaging came out ahead by ${formatCurrency(-result.gap)} in this scenario.`}{' '}
                Try the &quot;Downturn, then recovery&quot; scenario to see the case where
                DCA reduces regret even if it doesn&apos;t always win on ending balance.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        This simulator is informational only, not personalized financial advice. Each
        scenario uses a fixed, illustrative sequence of monthly returns — not a real
        market forecast — so you can see how timing affects the two strategies under
        the same average return.
      </p>
    </div>
  );
}
