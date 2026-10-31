const { db } = require('../db/database');

function getFinanceSummary({ dateRangeStart = null, dateRangeEnd = null } = {}) {
  const today = new Date().toISOString().split('T')[0];

  // 1. Active Subscriptions Count & Details
  const activeSubs = db.prepare(`
    SELECT s.*, p.price as plan_price, p.period as plan_period,
           (SELECT SUM(amount) FROM subscription_lines WHERE subscription_id = s.id) as line_total
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.status = 'Active'
  `).all();

  // 2. Compute MRR (Monthly Recurring Revenue)
  let mrr = 0;
  for (const sub of activeSubs) {
    const value = sub.line_total || sub.plan_price || 0;
    if (sub.plan_period === 'monthly') {
      mrr += value;
    } else if (sub.plan_period === 'yearly') {
      mrr += value / 12;
    } else if (sub.plan_period === 'weekly') {
      mrr += value * 4.33;
    } else if (sub.plan_period === 'daily') {
      mrr += value * 30;
    }
  }

  // 3. Total Collected Revenue
  const collectedRow = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM payments').get();
  const revenueCollected = Number((collectedRow.total || 0).toFixed(2));

  // 4. Invoices and Outstanding Amount
  const invoices = db.prepare(`
    SELECT inv.*,
           (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = inv.id) as paid
    FROM invoices inv
    WHERE inv.status != 'Cancelled'
  `).all();

  let totalBilled = 0;
  let totalOutstanding = 0;
  let overdueCount = 0;
  let overdueAmount = 0;

  for (const inv of invoices) {
    totalBilled += inv.total;
    const unpaid = Math.max(0, inv.total - inv.paid);
    totalOutstanding += unpaid;

    if (unpaid > 0 && inv.due_date < today) {
      overdueCount++;
      overdueAmount += unpaid;
    }
  }

  return {
    activeSubscriptionsCount: activeSubs.length,
    monthlyRecurringRevenue: Number(mrr.toFixed(2)),
    revenueCollected,
    totalBilled: Number(totalBilled.toFixed(2)),
    totalOutstanding: Number(totalOutstanding.toFixed(2)),
    overdueInvoicesCount: overdueCount,
    overdueAmount: Number(overdueAmount.toFixed(2)),
    generatedAt: new Date().toISOString()
  };
}

function getOverdueInvoices() {
  const today = new Date().toISOString().split('T')[0];
  const rows = db.prepare(`
    SELECT inv.*, s.number as subscription_number, u.name as customer_name, u.email as customer_email,
           (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = inv.id) as amount_paid
    FROM invoices inv
    JOIN subscriptions s ON inv.subscription_id = s.id
    JOIN users u ON s.customer_id = u.id
    WHERE inv.status IN ('Draft', 'Confirmed')
      AND inv.due_date < ?
    ORDER BY inv.due_date ASC
  `).all(today);

  return rows.map(inv => ({
    ...inv,
    balance: Number((inv.total - inv.amount_paid).toFixed(2))
  })).filter(inv => inv.balance > 0);
}

function exportCsv() {
  const invoices = db.prepare(`
    SELECT inv.number, inv.status, inv.period_start, inv.period_end, inv.due_date,
           inv.subtotal, inv.discount_total, inv.tax_total, inv.total,
           u.name as customer_name, u.email as customer_email, s.number as sub_number
    FROM invoices inv
    JOIN subscriptions s ON inv.subscription_id = s.id
    JOIN users u ON s.customer_id = u.id
    ORDER BY inv.created_at DESC
  `).all();

  const headers = ['Invoice Number', 'Subscription', 'Customer', 'Email', 'Status', 'Period Start', 'Period End', 'Due Date', 'Subtotal', 'Discount', 'Tax', 'Total'];
  const lines = [headers.join(',')];

  for (const r of invoices) {
    lines.push([
      `"${r.number}"`,
      `"${r.sub_number}"`,
      `"${r.customer_name}"`,
      `"${r.customer_email}"`,
      `"${r.status}"`,
      `"${r.period_start}"`,
      `"${r.period_end}"`,
      `"${r.due_date}"`,
      r.subtotal,
      r.discount_total,
      r.tax_total,
      r.total
    ].join(','));
  }

  return lines.join('\n');
}

module.exports = {
  getFinanceSummary,
  getOverdueInvoices,
  exportCsv
};
