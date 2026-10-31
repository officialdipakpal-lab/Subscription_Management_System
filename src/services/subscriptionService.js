const crypto = require('node:crypto');
const { db } = require('../db/database');
const { getPlanById } = require('./catalogService');

function generateSubscriptionNumber() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM subscriptions').get();
  const nextNum = (countRow.count || 0) + 1;
  return `SUB-${String(nextNum).padStart(4, '0')}`;
}

function getAllSubscriptions({ customerId = null, status = null } = {}) {
  let query = `
    SELECT s.*, u.name as customer_name, u.email as customer_email, p.name as plan_name, p.period as plan_period
    FROM subscriptions s
    JOIN users u ON s.customer_id = u.id
    JOIN plans p ON s.plan_id = p.id
    WHERE 1=1
  `;
  const params = [];

  if (customerId) {
    query += ' AND s.customer_id = ?';
    params.push(customerId);
  }

  if (status) {
    query += ' AND s.status = ?';
    params.push(status);
  }

  query += ' ORDER BY s.created_at DESC';

  const rows = db.prepare(query).all(...params);
  return rows.map(sub => {
    const lines = db.prepare(`
      SELECT sl.*, pr.name as product_name, v.attribute as variant_attr, v.value as variant_val
      FROM subscription_lines sl
      JOIN products pr ON sl.product_id = pr.id
      LEFT JOIN variants v ON sl.variant_id = v.id
      WHERE sl.subscription_id = ?
    `).all(sub.id);
    return { ...sub, lines };
  });
}

function getSubscriptionById(id) {
  const sub = db.prepare(`
    SELECT s.*, u.name as customer_name, u.email as customer_email, p.name as plan_name, p.period as plan_period
    FROM subscriptions s
    JOIN users u ON s.customer_id = u.id
    JOIN plans p ON s.plan_id = p.id
    WHERE s.id = ?
  `).get(id);

  if (!sub) return null;

  const lines = db.prepare(`
    SELECT sl.*, pr.name as product_name, v.attribute as variant_attr, v.value as variant_val
    FROM subscription_lines sl
    JOIN products pr ON sl.product_id = pr.id
    LEFT JOIN variants v ON sl.variant_id = v.id
    WHERE sl.subscription_id = ?
  `).all(id);

  return { ...sub, lines };
}

function createSubscription({
  customerId,
  planId,
  startDate,
  expiryDate = null,
  paymentTerms = 'Due on receipt',
  lines = []
}) {
  const plan = getPlanById(planId);
  if (!plan) throw new Error('Selected plan does not exist.');

  const subId = crypto.randomUUID();
  const subNumber = generateSubscriptionNumber();
  const nextBillingDate = startDate;

  db.prepare(`
    INSERT INTO subscriptions (
      id, number, customer_id, plan_id, start_date, expiry_date,
      payment_terms, status, next_billing_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Draft', ?)
  `).run(subId, subNumber, customerId, planId, startDate, expiryDate, paymentTerms, nextBillingDate);

  for (const line of lines) {
    const lineId = crypto.randomUUID();
    const unitPrice = Number(line.unit_price);
    const quantity = Number(line.quantity || 1);
    const amount = Number((unitPrice * quantity).toFixed(2));

    db.prepare(`
      INSERT INTO subscription_lines (
        id, subscription_id, product_id, variant_id, quantity, unit_price, tax_rate, amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(lineId, subId, line.product_id, line.variant_id || null, quantity, unitPrice, Number(line.tax_rate || 0), amount);
  }

  return getSubscriptionById(subId);
}

// Server-side State Machine transitions
const VALID_TRANSITIONS = {
  Draft: ['Quotation', 'Closed'],
  Quotation: ['Confirmed', 'Closed'],
  Confirmed: ['Active', 'Closed'],
  Active: ['Paused', 'Closed', 'Active'], // Self-transition is renewal
  Paused: ['Active', 'Closed'],
  Closed: []
};

function updateSubscriptionStatus(subscriptionId, targetStatus, user = null) {
  const sub = getSubscriptionById(subscriptionId);
  if (!sub) throw new Error('Subscription not found.');

  // Customer ownership authorization check
  if (user && user.role === 'Customer' && sub.customer_id !== user.id) {
    throw new Error('Access denied. You can only manage your own subscriptions.');
  }

  const allowed = VALID_TRANSITIONS[sub.status] || [];
  if (!allowed.includes(targetStatus)) {
    throw new Error(`Illegal state transition from '${sub.status}' to '${targetStatus}'.`);
  }

  // Plan lifecycle permission checks
  const plan = getPlanById(sub.plan_id);
  if (targetStatus === 'Paused' && !plan.pausable) {
    throw new Error(`This plan does not permit pausing.`);
  }
  if (targetStatus === 'Closed' && sub.status === 'Active' && !plan.closable) {
    throw new Error(`This plan does not permit early closure.`);
  }

  db.prepare('UPDATE subscriptions SET status = ? WHERE id = ?').run(targetStatus, subscriptionId);
  return getSubscriptionById(subscriptionId);
}

function pauseSubscription(subscriptionId, user) {
  return updateSubscriptionStatus(subscriptionId, 'Paused', user);
}

function resumeSubscription(subscriptionId, user) {
  return updateSubscriptionStatus(subscriptionId, 'Active', user);
}

function closeSubscription(subscriptionId, user) {
  return updateSubscriptionStatus(subscriptionId, 'Closed', user);
}

function renewSubscription(subscriptionId, user) {
  const sub = getSubscriptionById(subscriptionId);
  if (!sub) throw new Error('Subscription not found.');

  if (user && user.role === 'Customer' && sub.customer_id !== user.id) {
    throw new Error('Access denied.');
  }

  const plan = getPlanById(sub.plan_id);
  if (!plan.renewable) {
    throw new Error('This plan does not support manual renewal.');
  }

  // Advance expiry date if present
  let newExpiry = null;
  if (sub.expiry_date) {
    const d = new Date(sub.expiry_date);
    if (plan.period === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (plan.period === 'yearly') d.setFullYear(d.getFullYear() + 1);
    else if (plan.period === 'weekly') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    newExpiry = d.toISOString().split('T')[0];
    db.prepare('UPDATE subscriptions SET expiry_date = ?, status = ? WHERE id = ?').run(newExpiry, 'Active', subscriptionId);
  }

  return getSubscriptionById(subscriptionId);
}

// Quotation Templates
function getAllQuoteTemplates() {
  const templates = db.prepare(`
    SELECT qt.*, p.name as plan_name, p.period as plan_period
    FROM quote_templates qt
    LEFT JOIN plans p ON qt.plan_id = p.id
    ORDER BY qt.name ASC
  `).all();

  return templates.map(t => {
    const lines = db.prepare(`
      SELECT qtl.*, pr.name as product_name, v.attribute as variant_attr, v.value as variant_val
      FROM quote_template_lines qtl
      JOIN products pr ON qtl.product_id = pr.id
      LEFT JOIN variants v ON qtl.variant_id = v.id
      WHERE qtl.template_id = ?
    `).all(t.id);
    return { ...t, lines };
  });
}

function createSubscriptionFromTemplate(templateId, { customerId, startDate }) {
  const template = db.prepare('SELECT * FROM quote_templates WHERE id = ?').get(templateId);
  if (!template) throw new Error('Template not found.');

  const lines = db.prepare('SELECT * FROM quote_template_lines WHERE template_id = ?').all(templateId);

  // Expiry date calculated from template validity_days
  const start = new Date(startDate || new Date().toISOString().split('T')[0]);
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + (template.validity_days || 15));

  return createSubscription({
    customerId,
    planId: template.plan_id,
    startDate: start.toISOString().split('T')[0],
    expiryDate: expiry.toISOString().split('T')[0],
    paymentTerms: `Quote valid for ${template.validity_days} days`,
    lines: lines.map(l => ({
      product_id: l.product_id,
      variant_id: l.variant_id,
      quantity: l.quantity,
      unit_price: l.unit_price,
      tax_rate: 0
    }))
  });
}

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscriptionStatus,
  pauseSubscription,
  resumeSubscription,
  closeSubscription,
  renewSubscription,
  getAllQuoteTemplates,
  createSubscriptionFromTemplate
};
