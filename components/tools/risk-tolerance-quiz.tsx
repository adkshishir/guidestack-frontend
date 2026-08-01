'use client';

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuizOption {
  label: string;
  points: 1 | 2 | 3 | 4;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'reaction-to-drop',
    question: 'Your portfolio drops 20% in a month. What do you do?',
    options: [
      { label: 'Sell everything to avoid further loss', points: 1 },
      { label: 'Sell some to reduce risk', points: 2 },
      { label: 'Hold and wait it out', points: 3 },
      { label: 'Buy more while prices are low', points: 4 },
    ],
  },
  {
    id: 'time-horizon',
    question: "What's your primary investing time horizon?",
    options: [
      { label: 'Less than 3 years', points: 1 },
      { label: '3–7 years', points: 2 },
      { label: '7–15 years', points: 3 },
      { label: '15+ years', points: 4 },
    ],
  },
  {
    id: 'experience',
    question: 'How much investing experience do you have?',
    options: [
      { label: 'None, this would be my first time', points: 1 },
      { label: 'A little, mostly savings accounts or CDs', points: 2 },
      { label: "Some, I've owned index funds or a 401(k)", points: 3 },
      { label: 'Extensive, I actively manage a portfolio', points: 4 },
    ],
  },
  {
    id: 'goal',
    question: 'Which statement best matches your goal?',
    options: [
      { label: 'Preserve what I have', points: 1 },
      { label: 'Modest growth with low risk', points: 2 },
      { label: 'Balanced growth', points: 3 },
      { label: "Maximize long-term growth — I'm fine with risk", points: 4 },
    ],
  },
  {
    id: 'liquidity-need',
    question: 'If you needed this money unexpectedly, how soon would that likely be?',
    options: [
      { label: 'Within 1 year', points: 1 },
      { label: '1–3 years', points: 2 },
      { label: '3–5 years', points: 3 },
      { label: 'Not for 5+ years', points: 4 },
    ],
  },
  {
    id: 'volatility-comfort',
    question: 'How do you feel about investment volatility (ups and downs)?',
    options: [
      { label: 'Very uncomfortable — I check my balance often', points: 1 },
      { label: 'Somewhat uncomfortable', points: 2 },
      { label: "Neutral — I understand it's part of investing", points: 3 },
      { label: "Comfortable — volatility doesn't bother me", points: 4 },
    ],
  },
  {
    id: 'concentration',
    question: 'What share of your total savings is this investment account?',
    options: [
      { label: "More than 75% — it's most of what I have", points: 1 },
      { label: '50–75%', points: 2 },
      { label: '25–50%', points: 3 },
      { label: 'Less than 25% — I have other savings/income', points: 4 },
    ],
  },
];

const MIN_SCORE = QUESTIONS.length * 1;
const MAX_SCORE = QUESTIONS.length * 4;

function getProfile(score: number) {
  const stockAllocation = Math.round(
    15 + ((score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)) * 80,
  );
  const clamped = Math.min(95, Math.max(10, stockAllocation));

  let label: string;
  if (clamped < 30) label = 'Conservative';
  else if (clamped < 50) label = 'Moderately Conservative';
  else if (clamped < 70) label = 'Moderate';
  else if (clamped < 85) label = 'Growth';
  else label = 'Aggressive';

  return { stockAllocation: clamped, bondAllocation: 100 - clamped, label };
}

export function RiskToleranceQuiz() {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === QUESTIONS.length;

  const result = useMemo(() => {
    if (!isComplete) return null;
    const score = Object.values(answers).reduce((sum, p) => sum + p, 0);
    return { score, ...getProfile(score) };
  }, [answers, isComplete]);

  const chartData = result
    ? [
        { name: 'Stocks', value: result.stockAllocation },
        { name: 'Bonds & cash', value: result.bondAllocation },
      ]
    : [];

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        {answeredCount} of {QUESTIONS.length} answered
      </p>

      {QUESTIONS.map((q, index) => (
        <Card key={q.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {index + 1}. {q.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[q.id]?.toString() ?? ''}
              onValueChange={(value) =>
                setAnswers((prev) => ({ ...prev, [q.id]: Number(value) }))
              }
              className="gap-3"
            >
              {q.options.map((option) => {
                const id = `${q.id}-${option.points}`;
                return (
                  <div key={id} className="flex items-center gap-3">
                    <RadioGroupItem value={option.points.toString()} id={id} />
                    <Label htmlFor={id} className="font-normal">
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Your risk profile: {result.label}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 sm:items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    <Cell fill="var(--chart-2)" />
                    <Cell fill="var(--chart-3)" />
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Suggested allocation range for a {result.label.toLowerCase()} investor
              </p>
              <p className="text-2xl font-bold text-foreground">
                {result.stockAllocation}% stocks / {result.bondAllocation}% bonds &amp; cash
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Most robo-advisors ask a version of these same questions during
                onboarding and land on a similar split. If the allocation a platform
                assigns you is far from this, it's worth asking why before you fund
                the account.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        This quiz is informational only, not personalized financial advice. It's a
        simplified version of the questionnaires robo-advisors use — a real allocation
        decision should also account for your full financial picture, not just risk
        comfort.
      </p>
    </div>
  );
}
