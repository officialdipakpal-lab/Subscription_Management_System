const crypto = require('node:crypto');
const { db } = require('../db/database');
const { calculatePricing } = require('./discountTaxEngine');
const { generateInvoiceNumber } = require('./invoiceService');

function advanceDate(dateStr, period) {
  const d = new Date(dateStr);
  if (period === 'daily') {
    d.setDate(d.getDate() + 1);
  } else if (period === 'weekly') {
    d.setDate(d.getDate() + 7);
  } else if (period === 'monthly') {
    d.setMonth(d.getMonth() + 1);
  } else if (period === 'yearly') {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d.toISOString().split('T')[0];
}

function runBillingEngine(manualTriggerDate = null) {
  const today = manualTriggerDate || new Date().toISOString().split('T')[0];

  // 1. Find all active subscriptions due on or before today
  const dueSubscriptions = db.prepare(`
    SELECT s.*, p.period, p.auto_close, u.name as customer_name, u.email as customer_email
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    JOIN users u ON s.customer_id = u.id
    WHERE s.status = 'Active'
      AND s.next_billing_date <= ?
    ORDER BY s.next_billing_date ASC
  `).all(today);

  const results = {
    runDate: today,
    dueSubscriptionsFound: dueSubscriptions.length,
    invoicesCreated: 0,
    alreadyBilledSkipped: 0,
    closedDueToExpiry: 0,
    invoices: [],
    errors: []
  };

  for (const sub of dueSubscriptions) {
    try {
      const periodStart = sub.next_billing_date;
      const periodEnd = advanceDate(periodStart, sub.period);

      // Idempotency check: unique constraint on (subscription_id, period_start, period_end)
      const existingInvoice = db.prepare(`
        SELECT id, number FROM invoices
        WHERE subscription_id = ? AND period_start = ? AND period_end = ?
      `).get(sub.id, periodStart, periodEnd);

      if (existingInvoice) {
        results.alreadyBilledSkipped++;
        continue;
      }

      // Fetch subscription line items
      const subLines = db.prepare(`
        SELECT sl.*, p.name as product_name
        FROM subscription_lines sl
        JOIN products p ON sl.product_id = p.id
        WHERE sl.subscription_id = ?
      `).all(sub.id);

      // Run pricing, discount, and tax calculation
      const pricing = calculatePricing({
        lines: subLines,
        customerId: sub.customer_id
      });

      const invoiceId = crypto.randomUUID();
      const invoiceNumber = generateInvoiceNumber();

      // Due date: 14 days after period_start by default
      const dueDateObj = new Date(periodStart);
      dueDateObj.setDate(dueDateObj.getDate() + 14);
      const dueDate = dueDateObj.toISOString().split('T')[0];

      // Insert invoice
      db.prepare(`
        INSERT INTO invoices (
          id, number, subscription_id, period_start, period_end,
          subtotal, discount_total, tax_total, total, status, due_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft', ?)
      `).run(
        invoiceId,
        invoiceNumber,
        sub.id,
        periodStart,
        periodEnd,
        pricing.subtotal,
        pricing.discount_total,
        pricing.tax_total,
        pricing.total,
        dueDate
      );

      // Insert invoice line items
      for (const line of pricing.lines) {
        const lineId = crypto.randomUUID();
        db.prepare(`
          INSERT INTO invoice_lines (
            id, invoice_id, product_id, description, quantity, unit_price, amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          lineId,
          invoiceId,
          line.product_id,
          `${line.product_name} (${sub.period} subscription)`,
          line.quantity,
          line.unit_price,
          line.amount
        );
      }

      // Increment discount usage atomically if a discount was applied
      if (pricing.discount_rule_id) {
        db.prepare(`
          UPDATE discount_rules 
          SET used_count = used_count + 1 
          WHERE id = ?
        `).run(pricing.discount_rule_id);
      }

      // Advance next_billing_date
      db.prepare('UPDATE subscriptions SET next_billing_date = ? WHERE id = ?').run(periodEnd, sub.id);

      // Check auto-close if expiry_date reached
      if (sub.expiry_date && sub.expiry_date <= periodEnd && sub.auto_close) {
        db.prepare("UPDATE subscriptions SET status = 'Closed' WHERE id = ?").run(sub.id);
        results.closedDueToExpiry++;
      }

      results.invoicesCreated++;
      results.invoices.push({
        invoiceId,
        invoiceNumber,
        subscriptionNumber: sub.number,
        customer: sub.customer_name,
        periodStart,
        periodEnd,
        total: pricing.total
      });
    } catch (err) {
      results.errors.push({
        subscriptionId: sub.id,
        subscriptionNumber: sub.number,
        error: err.message
      });
    }
  }

  return results;
}

module.exports = {
  runBillingEngine,
  advanceDate
};
