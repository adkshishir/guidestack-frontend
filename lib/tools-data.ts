/**
 * Registry of WealthAlgor's interactive tools. Each tool maps 1:1 to a
 * taxonomy subcategory slug from backend/src/seed-categories.ts so tool
 * pages, category pages, and blog posts can cross-link without a DB call.
 */

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  /** Matching subcategory slug from backend/src/seed-categories.ts */
  categorySlug: string;
  /**
   * True when the tool ships hardcoded provider fee figures, which must carry a
   * visible verification date. Tools driven purely by user input do not.
   */
  usesPlatformFeeData?: boolean;
  faqs: ToolFaq[];
}

export const TOOLS: ToolDefinition[] = [
  {
    slug: 'robo-advisor-fee-calculator',
    usesPlatformFeeData: true,
    title: 'Robo-Advisor Fee Comparison Calculator',
    shortTitle: 'Fee Comparison Calculator',
    description:
      'See the real dollar cost of robo-advisor management fees on your balance over time, compared side by side across platforms.',
    categorySlug: 'fees-and-fine-print',
    faqs: [
      {
        question: 'How much difference can robo-advisor fees really make over time?',
        answer:
          'Even a 0.25% difference in annual advisory fees compounds significantly over decades. On a $50,000 balance growing at 7% annually, a 0.25% fee versus a 0.50% fee can mean tens of thousands of dollars of difference by retirement, because the fee is charged on your growing balance every year, not just your original deposit.',
      },
      {
        question: 'Does this calculator include fund expense ratios, or just the advisory fee?',
        answer:
          "This calculator focuses on the robo-advisor's management/advisory fee — the percentage charged for managing your account. Most robo-advisors also pass through underlying ETF expense ratios (typically 0.03%–0.15%), which are a separate, usually smaller cost layered on top.",
      },
      {
        question: 'Is a lower fee always the better choice?',
        answer:
          "Not necessarily. Fee is one input, not the whole picture — features like automatic tax-loss harvesting, human advisor access, or account minimums can offset a higher fee for some investors. Use this calculator to quantify the fee gap, then weigh it against what each platform actually offers.",
      },
      {
        question: 'How often do robo-advisors charge these fees?',
        answer:
          'Most charge the advisory fee as an annual percentage of assets under management, deducted incrementally — usually monthly or quarterly — directly from your account balance rather than billed separately.',
      },
    ],
  },
  {
    slug: 'robo-advisor-retirement-calculator',
    title: 'Retirement Savings & Drawdown Calculator',
    shortTitle: 'Retirement Calculator',
    description:
      'Project your balance at retirement and estimate a sustainable annual withdrawal amount based on your savings plan.',
    categorySlug: 'retirement-drawdown',
    faqs: [
      {
        question: 'What withdrawal rate does this calculator assume is "safe"?',
        answer:
          'It defaults to a framework based on the traditional 4% rule, which estimates how much you can withdraw annually from a retirement portfolio with a low risk of running out of money over roughly a 30-year retirement. Your actual safe rate depends on your time horizon, portfolio mix, and market conditions.',
      },
      {
        question: 'Does this calculator account for inflation?',
        answer:
          'Yes — projections are inflation-adjusted so the numbers reflect purchasing power in today\'s dollars, not just a nominal future balance.',
      },
      {
        question: 'What if I plan to retire early or need my money to last longer than 30 years?',
        answer:
          'Longer retirement horizons generally require a lower, more conservative withdrawal rate than the standard 4% guideline. Adjust your target retirement age and expected timeline in the calculator inputs to see how a longer drawdown period changes the sustainable withdrawal estimate.',
      },
      {
        question: 'Does this replace working with a financial planner?',
        answer:
          "No. It's a planning estimate based on the numbers you enter, not personalized financial advice. For a full retirement plan that accounts for taxes, healthcare costs, and Social Security timing, a fee-only financial planner can go deeper than any calculator.",
      },
    ],
  },
  {
    slug: 'tax-loss-harvesting-calculator',
    title: 'Tax-Loss Harvesting Savings Estimator',
    shortTitle: 'Tax-Loss Harvesting Estimator',
    description:
      'Estimate how much automated tax-loss harvesting could save you, including the $3,000/year ordinary-income offset limit and loss carryforward.',
    categorySlug: 'tax-loss-harvesting',
    faqs: [
      {
        question: 'How much can tax-loss harvesting actually save me?',
        answer:
          'The savings depend on your tax bracket, how much unrealized loss is available to harvest, and how the $3,000/year ordinary-income offset limit applies. This estimator models those variables using your inputs so you can see a realistic dollar range rather than a marketing claim.',
      },
      {
        question: 'What is the $3,000 offset limit?',
        answer:
          'The IRS caps the amount of net capital losses you can deduct against ordinary income at $3,000 per year ($1,500 if married filing separately). Losses beyond that carry forward to future tax years indefinitely.',
      },
      {
        question: 'What is the wash-sale rule, and does it affect this estimate?',
        answer:
          'The wash-sale rule disallows a tax loss if you buy a "substantially identical" security within 30 days before or after the sale. Automated tax-loss harvesting is designed to swap into a similar-but-not-identical fund to stay compliant — this estimator assumes harvesting is executed correctly and does not model wash-sale violations.',
      },
      {
        question: 'Is tax-loss harvesting worth it for a small account?',
        answer:
          'The dollar benefit scales with your balance and the amount of market volatility available to harvest against, so it tends to matter less on very small accounts. Run your own numbers here rather than assuming a flat percentage benefit.',
      },
    ],
  },
  {
    slug: 'risk-tolerance-quiz',
    title: 'Risk Tolerance Quiz',
    shortTitle: 'Risk Tolerance Quiz',
    description:
      'Answer a few questions to get a risk profile and a suggested stock/bond allocation range to compare against what a robo-advisor assigns you.',
    categorySlug: 'first-time-investor-onboarding',
    faqs: [
      {
        question: 'How does this quiz determine my risk profile?',
        answer:
          "It scores your answers across factors like time horizon, comfort with market drops, and investment goals, then maps that score to a suggested stock/bond allocation range — similar to the onboarding questionnaires robo-advisors use.",
      },
      {
        question: 'Why would I compare this to what a robo-advisor assigned me?',
        answer:
          'Robo-advisor questionnaires vary in length and methodology, and some default toward more conservative allocations to reduce support calls during downturns. Comparing your own quiz result against your assigned portfolio can flag a mismatch worth asking the platform about.',
      },
      {
        question: 'Should I change my portfolio every time my risk tolerance shifts slightly?',
        answer:
          'No — risk tolerance quizzes are meant to set a general direction, not trigger frequent trading. Large life changes, like a new job, nearing retirement, or a shifted timeline, are better reasons to revisit your allocation than day-to-day market mood.',
      },
      {
        question: 'Is a higher risk tolerance always better for returns?',
        answer:
          'Not automatically. Taking on more risk than you can emotionally handle often leads to panic-selling during downturns, which locks in losses. The "right" allocation is one you can actually stick with through a market decline.',
      },
    ],
  },
  {
    slug: 'dca-vs-lump-sum-calculator',
    title: 'Dollar-Cost Averaging vs Lump-Sum Simulator',
    shortTitle: 'DCA vs Lump-Sum Simulator',
    description:
      'Compare investing a lump sum immediately versus spreading it out over time, across different market scenarios.',
    categorySlug: 'dollar-cost-averaging',
    faqs: [
      {
        question: 'Is dollar-cost averaging or lump-sum investing better?',
        answer:
          'Historically, investing a lump sum immediately has outperformed dollar-cost averaging in most market environments, simply because markets trend upward over time and more money is invested for longer. But DCA can reduce regret and volatility exposure if the market drops shortly after you invest — this simulator lets you compare both approaches across different scenarios instead of relying on a rule of thumb.',
      },
      {
        question: 'What market scenarios does this simulator use?',
        answer:
          'You can compare outcomes across different historical or hypothetical return sequences — including up markets, down markets, and flat or choppy periods — to see how sensitive each strategy is to timing.',
      },
      {
        question: 'Does DCA reduce risk, or just spread it out?',
        answer:
          'It spreads out your entry price over time, which reduces the risk of investing everything right before a downturn, but it also means less time in the market on average — which cuts both ways.',
      },
      {
        question: 'How long should a DCA schedule last?',
        answer:
          "There's no universal answer — common approaches range from a few months to a year. Use the simulator to test different schedules against your own lump-sum amount and timeline.",
      },
    ],
  },
  {
    slug: 'round-up-investing-calculator',
    title: 'Round-Up Investing Growth Estimator',
    shortTitle: 'Round-Up Investing Estimator',
    description:
      'See how much spare-change round-ups from everyday purchases could grow into over time, with or without a round-up multiplier.',
    categorySlug: 'round-up-investing',
    faqs: [
      {
        question: 'How much can spare-change round-ups realistically grow to?',
        answer:
          'It depends heavily on your spending volume and the multiplier you use. Someone with frequent small purchases and a 2x or 3x round-up multiplier can accumulate meaningfully more than someone using plain 1x round-ups — this estimator lets you model both.',
      },
      {
        question: 'Is round-up investing enough on its own to reach my goals?',
        answer:
          'Usually not by itself — round-ups are best treated as a supplement to, not a replacement for, a regular contribution plan like automatic transfers or 401(k) contributions.',
      },
      {
        question: 'Do round-up investing apps charge fees?',
        answer:
          'Many charge a flat monthly fee rather than a percentage of assets, which can be a high effective fee rate on very small balances. Factor that into whether round-up investing is cost-effective for your spending pattern.',
      },
      {
        question: 'Does a round-up multiplier actually change the growth meaningfully?',
        answer:
          'Yes — a 2x or 3x multiplier directly multiplies your invested amount per transaction, which compounds significantly over years. Try different multiplier settings in the estimator to see the long-run difference.',
      },
    ],
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export function getToolByCategorySlug(
  categorySlug: string,
): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.categorySlug === categorySlug);
}
