/**
 * Plan limits for monetization.
 * Free: 1 widget, 100 reports/month (good for trying out).
 * Pro: 10 widgets, 2,000 reports/month (for serious sites / US traffic).
 * Team: 50 widgets, 20,000 reports/month (agencies / multiple clients).
 */
const PLANS = {
  free: { widgets: 1, reportsPerMonth: 100 },
  pro: { widgets: 10, reportsPerMonth: 2000 },
  team: { widgets: 50, reportsPerMonth: 20000 },
};

function getLimits(plan) {
  return PLANS[plan] || PLANS.free;
}

module.exports = { PLANS, getLimits };
