/**
 * The one list of care plans. Read by the /services pricing grid and by the
 * enquiry form's plan picker, so the two can't drift apart the way they would
 * if the form restated them.
 *
 * Ongoing work only. A new build is quoted against a written scope, and it is
 * sold further up /services as the "Project sites" service, so it is not a row
 * here: a per-project quote sitting in a month-to-month grid reads as the top
 * monthly tier, and priced it against the two beside it.
 *
 * `id` is what the form submits, so don't rename one without checking the copy
 * in existing submissions still reads correctly.
 */
export type CarePlan = {
  id: string
  name: string
  price: string
  period: string
  /** one line, shown under the name in both places */
  description: string
  features: readonly string[]
  /** the longer answer, for someone who doesn't know which one to pick */
  guidance: string
}

export const CARE_PLANS = [
  {
    id: 'care',
    name: 'Care',
    price: '$299',
    period: 'per month',
    description: 'Hosting, backups and updates so the site stays fast and secure.',
    features: [
      'Managed hosting & SSL',
      'Daily backups, uptime monitoring',
      'Framework & security updates',
      'One new project added to your site each month',
    ],
    guidance:
      'Choose this if the site is built and you want it looked after. Hosting, backups and updates are handled, and each month you send through one finished job with its photos, and it goes up on the site.',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$599',
    period: 'per month',
    description: 'Everything in Care, plus active local search and a steady publishing rhythm.',
    features: [
      'Everything in Care',
      'Google Business Profile management',
      'Two articles published each month',
      'Up to three new projects added to your site each month',
      'Monthly search & enquiry report',
    ],
    guidance:
      'Choose this if you want the site worked on every month rather than just kept running. Your Google Business Profile is managed, finished jobs go up as you send them, and each month you get a report on where you are showing up and what came in.',
  },
] as const satisfies readonly CarePlan[]

/**
 * The picker's escape hatch. Not a plan, so it lives here rather than in
 * CARE_PLANS, which the pricing grid renders wholesale.
 */
export const UNSURE_PLAN_ID = 'unsure'

/** What the panel and the form pass around. Derived, so a typo won't compile. */
export type PlanId = (typeof CARE_PLANS)[number]['id'] | typeof UNSURE_PLAN_ID

export const PLAN_LABELS: Record<string, string> = Object.fromEntries(
  CARE_PLANS.map((plan) => [plan.id, plan.name]),
)
