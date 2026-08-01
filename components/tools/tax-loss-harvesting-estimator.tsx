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

const ORDINARY_INCOME_OFFSET_CAP = 3000;

const formSchema = z.object({
  taxableBalance: z.coerce.number().min(0).max(50_000_000),
  harvestRate: z.coerce.number().min(0).max(20),
  otherRealizedGains: z.coerce.number().min(0).max(1_000_000),
  ordinaryIncomeTaxRate: z.coerce.number().min(0).max(50),
  capitalGainsTaxRate: z.coerce.number().min(0).max(40),
  years: z.coerce.number().min(1).max(30),
});

type FormValues = z.infer<typeof formSchema>;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function projectHarvesting(v: FormValues) {
  const rows: {
    year: number;
    harvestedLoss: number;
    taxSaved: number;
    cumulativeTaxSaved: number;
    carryforward: number;
  }[] = [];

  let carryforward = 0;
  let cumulativeTaxSaved = 0;

  for (let year = 1; year <= v.years; year++) {
    const harvestedLoss = v.taxableBalance * (v.harvestRate / 100);
    const availableLoss = harvestedLoss + carryforward;

    const gainsOffset = Math.min(availableLoss, v.otherRealizedGains);
    const taxSavedFromGains = gainsOffset * (v.capitalGainsTaxRate / 100);

    const remainingAfterGains = availableLoss - gainsOffset;
    const incomeOffset = Math.min(
      remainingAfterGains,
      ORDINARY_INCOME_OFFSET_CAP,
    );
    const taxSavedFromIncome = incomeOffset * (v.ordinaryIncomeTaxRate / 100);

    carryforward = remainingAfterGains - incomeOffset;
    const taxSaved = taxSavedFromGains + taxSavedFromIncome;
    cumulativeTaxSaved += taxSaved;

    rows.push({
      year,
      harvestedLoss: Math.round(harvestedLoss),
      taxSaved: Math.round(taxSaved),
      cumulativeTaxSaved: Math.round(cumulativeTaxSaved),
      carryforward: Math.round(carryforward),
    });
  }

  return rows;
}

export function TaxLossHarvestingEstimator() {
  const { register, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      taxableBalance: 100000,
      harvestRate: 2,
      otherRealizedGains: 0,
      ordinaryIncomeTaxRate: 24,
      capitalGainsTaxRate: 15,
      years: 10,
    },
  });

  const values = watch();

  const result = useMemo(() => {
    const parsed = formSchema.safeParse(values);
    if (!parsed.success) return null;
    const rows = projectHarvesting(parsed.data);
    const last = rows[rows.length - 1];
    return { rows, last, years: parsed.data.years };
  }, [values]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="taxableBalance">Taxable account balance</Label>
            <Input
              id="taxableBalance"
              type="number"
              step="1000"
              {...register('taxableBalance')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="harvestRate">
              Expected annual harvestable losses (% of balance)
            </Label>
            <Input
              id="harvestRate"
              type="number"
              step="0.1"
              {...register('harvestRate')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="otherRealizedGains">
              Other realized capital gains this year (optional)
            </Label>
            <Input
              id="otherRealizedGains"
              type="number"
              step="100"
              {...register('otherRealizedGains')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Years to project</Label>
            <Input id="years" type="number" step="1" {...register('years')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ordinaryIncomeTaxRate">
              Marginal ordinary income tax rate (%)
            </Label>
            <Input
              id="ordinaryIncomeTaxRate"
              type="number"
              step="0.5"
              {...register('ordinaryIncomeTaxRate')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capitalGainsTaxRate">
              Long-term capital gains tax rate (%)
            </Label>
            <Input
              id="capitalGainsTaxRate"
              type="number"
              step="0.5"
              {...register('capitalGainsTaxRate')}
            />
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Cumulative tax savings over {result.years} years</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.rows}>
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
                    <Area
                      type="monotone"
                      dataKey="cumulativeTaxSaved"
                      name="Cumulative tax saved"
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
              <CardTitle>What this means for you</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total estimated tax saved over {result.years} years
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(result.last.cumulativeTaxSaved)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Loss carryforward remaining at the end
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(result.last.carryforward)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Unused losses carry forward indefinitely to offset future gains or
                  income — they don&apos;t expire.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        This calculator is informational only, not personalized tax or financial advice.
        It models the real IRS rule that harvested losses offset realized capital gains
        first, then up to {formatCurrency(ORDINARY_INCOME_OFFSET_CAP)}/year of ordinary
        income, with the rest carried forward — but it assumes a constant harvest rate and
        ignores wash-sale timing details. Talk to a tax professional before acting on this.
      </p>
    </div>
  );
}
