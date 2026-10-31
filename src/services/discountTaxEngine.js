const crypto = require('node:crypto');
const { db } = require('../db/database');

function getAllTaxes() {
  return db.prepare('SELECT * FROM tax_rules WHERE active = 1').all();
}

function createTaxRule({ name, rate, active = 1 }) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO tax_rules (id, name, rate, active)
    VALUES (?, ?, ?, ?)
  `).run(id, name, Number(rate), active ? 1 : 0);
  return db.prepare('SELECT * FROM tax_rules WHERE id = ?').get(id);
}

function getAllDiscounts() {
  return db.prepare('SELECT * FROM discount_rules ORDER BY used_count DESC').all();
}

function createDiscountRule({
  code,
  type,
  value,
  min_amount = 0,
  min_qty = 1,
  starts_on = null,
  ends_on = null,
  usage_limit = 999999,
  scope = 'subscription',
  target_product_id = null
}) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO discount_rules (
      id, code, type, value, min_amount, min_qty, starts_on, ends_on,
      usage_limit, used_count, scope, target_product_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(
    id,
    code.trim().toUpperCase(),
    type,
    Number(value),
    Number(min_amount),
    Number(min_qty),
    starts_on,
    ends_on,
    Number(usage_limit),
    scope,
    target_product_id
  );
  return db.prepare('SELECT * FROM discount_rules WHERE id = ?').get(id);
}

function calculatePricing({ lines = [], customerId = null, discountCode = null }) {
  const today = new Date().toISOString().split('T')[0];

  // 1. Calculate line amounts: (base + variant) * qty
  let subtotal = 0;
  const processedLines = lines.map(line => {
    const unitPrice = Number(line.unit_price || 0);
    const quantity = Number(line.quantity || 1);
    const amount = Number((unitPrice * quantity).toFixed(2));
    subtotal += amount;
    return {
      ...line,
      amount
    };
  });

  // 2. Determine best eligible discount rule
  let eligibleDiscounts = [];
  if (discountCode) {
    const rule = db.prepare('SELECT * FROM discount_rules WHERE code = ?').get(discountCode.trim().toUpperCase());
    if (rule) eligibleDiscounts.push(rule);
  } else {
    eligibleDiscounts = db.prepare(`
      SELECT * FROM discount_rules 
      WHERE (starts_on IS NULL OR starts_on <= ?)
        AND (ends_on IS NULL OR ends_on >= ?)
        AND used_count < usage_limit
    `).all(today, today);
  }

  let totalDiscount = 0;
  let appliedDiscountRule = null;

  for (const rule of eligibleDiscounts) {
    const totalQty = lines.reduce((acc, l) => acc + Number(l.quantity || 1), 0);
    if (subtotal < rule.min_amount || totalQty < rule.min_qty) {
      continue;
    }

    let calculatedDiscount = 0;
    if (rule.scope === 'subscription') {
      if (rule.type === 'percent') {
        calculatedDiscount = (subtotal * rule.value) / 100;
      } else {
        calculatedDiscount = rule.value;
      }
    } else if (rule.scope === 'product' && rule.target_product_id) {
      const targetLines = lines.filter(l => l.product_id === rule.target_product_id);
      const targetSubtotal = targetLines.reduce((acc, l) => acc + (l.unit_price * l.quantity), 0);
      if (rule.type === 'percent') {
        calculatedDiscount = (targetSubtotal * rule.value) / 100;
      } else {
        calculatedDiscount = rule.value;
      }
    }

    if (calculatedDiscount > totalDiscount) {
      totalDiscount = Math.min(calculatedDiscount, subtotal);
      appliedDiscountRule = rule;
    }
  }

  totalDiscount = Number(totalDiscount.toFixed(2));
  const taxableAmount = Math.max(0, subtotal - totalDiscount);

  // 3. Apply active tax rules
  const activeTaxes = getAllTaxes();
  let totalTax = 0;
  for (const tax of activeTaxes) {
    totalTax += taxableAmount * tax.rate;
  }
  totalTax = Number(totalTax.toFixed(2));

  const total = Number((taxableAmount + totalTax).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount_total: totalDiscount,
    applied_discount: appliedDiscountRule ? appliedDiscountRule.code : null,
    discount_rule_id: appliedDiscountRule ? appliedDiscountRule.id : null,
    tax_total: totalTax,
    total,
    lines: processedLines
  };
}

module.exports = {
  getAllTaxes,
  createTaxRule,
  getAllDiscounts,
  createDiscountRule,
  calculatePricing
};
