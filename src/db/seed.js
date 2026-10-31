const crypto = require('node:crypto');
const { db, initSchema } = require('./database');
const { hashPassword } = require('../services/authService');

function seedDatabase() {
  initSchema();

  console.log('🌱 Seeding database...');

  // Clear existing data for fresh idempotency
  db.exec(`
    DELETE FROM payments;
    DELETE FROM invoice_lines;
    DELETE FROM invoices;
    DELETE FROM subscription_lines;
    DELETE FROM subscriptions;
    DELETE FROM quote_template_lines;
    DELETE FROM quote_templates;
    DELETE FROM variants;
    DELETE FROM products;
    DELETE FROM plans;
    DELETE FROM tax_rules;
    DELETE FROM discount_rules;
    DELETE FROM reset_tokens;
    DELETE FROM users;
  `);

  // 1. Seed Team Members & Users (Earth Patel excluded)
  const users = [
    { id: 'usr-admin-1', email: 'admin@brightloop.test', name: 'Admin Lead', pass: 'Admin@1234', role: 'Admin' },
    { id: 'usr-dipak-1', email: 'dipak@brightloop.test', name: 'Dipak Pal', pass: 'Dipak@1234', role: 'Admin' },
    { id: 'usr-shivam-1', email: 'shivam@brightloop.test', name: 'Shivam Yadav', pass: 'Shivam@1234', role: 'Staff' },
    { id: 'usr-vijay-1', email: 'vijay@brightloop.test', name: 'Vijay Sharma', pass: 'Vijay@1234', role: 'Staff' },
    { id: 'usr-anirudh-1', email: 'anirudh@brightloop.test', name: 'Anirudh Kumar', pass: 'Anirudh@1234', role: 'Staff' },
    { id: 'usr-staff-1', email: 'staff@brightloop.test', name: 'Staff Member', pass: 'Staff@1234', role: 'Staff' },
    { id: 'usr-cust-1', email: 'customer@brightloop.test', name: 'Acme Software Ltd', pass: 'Customer@1234', role: 'Customer' },
    { id: 'usr-cust-2', email: 'shop@retailer.test', name: 'Metro Retail Mart', pass: 'Customer@1234', role: 'Customer' }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const u of users) {
    insertUser.run(u.id, u.email.toLowerCase(), hashPassword(u.pass), u.name, u.role);
  }

  // 2. Seed Products & Variants
  const p1Id = 'prod-erp-1';
  db.prepare(`
    INSERT INTO products (id, name, type, sales_price, cost_price, notes)
    VALUES (?, 'BrightERP Suite', 'Service', 1200.0, 400.0, 'Core enterprise ERP modules')
  `).run(p1Id);

  // Variant: Brand = Odoo (+560 extra) from Hackathon problem statement!
  const v1Id = 'var-odoo-1';
  db.prepare(`
    INSERT INTO variants (id, product_id, attribute, value, extra_price)
    VALUES (?, ?, 'Brand', 'Odoo', 560.0)
  `).run(v1Id, p1Id);

  db.prepare(`
    INSERT INTO variants (id, product_id, attribute, value, extra_price)
    VALUES (?, ?, 'Brand', 'Standard', 0.0)
  `).run('var-std-1', p1Id);

  const p2Id = 'prod-analytics-2';
  db.prepare(`
    INSERT INTO products (id, name, type, sales_price, cost_price, notes)
    VALUES (?, 'Advanced Analytics Add-on', 'Service', 350.0, 80.0, 'Real-time charts and reports')
  `).run(p2Id);

  const p3Id = 'prod-support-3';
  db.prepare(`
    INSERT INTO products (id, name, type, sales_price, cost_price, notes)
    VALUES (?, '24x7 Dedicated SLA Support', 'Service', 500.0, 150.0, 'Guaranteed 1-hour response')
  `).run(p3Id);

  // 3. Seed Plans
  const planMonthlyId = 'plan-monthly-1';
  db.prepare(`
    INSERT INTO plans (id, name, price, period, min_qty, available_from, available_to, auto_close, closable, pausable, renewable)
    VALUES (?, 'Growth Monthly Plan', 1200.0, 'monthly', 1, '2026-01-01', '2027-12-31', 0, 1, 1, 1)
  `).run(planMonthlyId);

  const planYearlyId = 'plan-yearly-2';
  db.prepare(`
    INSERT INTO plans (id, name, price, period, min_qty, available_from, available_to, auto_close, closable, pausable, renewable)
    VALUES (?, 'Enterprise Annual Plan', 12000.0, 'yearly', 1, '2026-01-01', '2027-12-31', 0, 1, 1, 1)
  `).run(planYearlyId);

  const planDailyId = 'plan-daily-3';
  db.prepare(`
    INSERT INTO plans (id, name, price, period, min_qty, available_from, available_to, auto_close, closable, pausable, renewable)
    VALUES (?, 'Trial Pilot Plan', 50.0, 'daily', 1, '2026-01-01', '2027-12-31', 1, 1, 0, 0)
  `).run(planDailyId);

  // 4. Seed Taxes & Discounts
  db.prepare(`
    INSERT INTO tax_rules (id, name, rate, active)
    VALUES ('tax-gst-18', 'GST 18%', 0.18, 1)
  `).run();

  db.prepare(`
    INSERT INTO discount_rules (
      id, code, type, value, min_amount, min_qty, starts_on, ends_on,
      usage_limit, used_count, scope, target_product_id
    ) VALUES (
      'disc-hack-15', 'ODOO15', 'percent', 15.0, 1000.0, 1, '2026-01-01', '2026-12-31',
      50, 0, 'subscription', NULL
    )
  `).run();

  db.prepare(`
    INSERT INTO discount_rules (
      id, code, type, value, min_amount, min_qty, starts_on, ends_on,
      usage_limit, used_count, scope, target_product_id
    ) VALUES (
      'disc-flat-500', 'SAVE500', 'fixed', 500.0, 2000.0, 1, '2026-01-01', '2026-12-31',
      10, 0, 'subscription', NULL
    )
  `).run();

  // 5. Seed Quote Template
  const templateId = 'qt-standard-1';
  db.prepare(`
    INSERT INTO quote_templates (id, name, validity_days, plan_id)
    VALUES (?, 'Odoo Standard Enterprise Quote', 15, ?)
  `).run(templateId, planMonthlyId);

  db.prepare(`
    INSERT INTO quote_template_lines (id, template_id, product_id, variant_id, quantity, unit_price)
    VALUES ('qtl-1', ?, ?, ?, 1, 1760.0)
  `).run(templateId, p1Id, v1Id); // 1200 base + 560 Odoo brand variant

  db.prepare(`
    INSERT INTO quote_template_lines (id, template_id, product_id, variant_id, quantity, unit_price)
    VALUES ('qtl-2', ?, ?, NULL, 1, 350.0)
  `).run(templateId, p2Id);

  // 6. Seed Subscriptions
  const sub1Id = 'sub-seed-1';
  db.prepare(`
    INSERT INTO subscriptions (
      id, number, customer_id, plan_id, start_date, expiry_date,
      payment_terms, status, next_billing_date
    ) VALUES (?, 'SUB-0001', 'usr-cust-1', ?, '2026-10-01', '2027-10-01', 'Net 30', 'Active', '2026-10-31')
  `).run(sub1Id, planMonthlyId);

  db.prepare(`
    INSERT INTO subscription_lines (id, subscription_id, product_id, variant_id, quantity, unit_price, tax_rate, amount)
    VALUES ('sl-1', ?, ?, ?, 1, 1760.0, 0.18, 1760.0)
  `).run(sub1Id, p1Id, v1Id);

  db.prepare(`
    INSERT INTO subscription_lines (id, subscription_id, product_id, variant_id, quantity, unit_price, tax_rate, amount)
    VALUES ('sl-2', ?, ?, NULL, 1, 350.0, 0.18, 350.0)
  `).run(sub1Id, p2Id);

  const sub2Id = 'sub-seed-2';
  db.prepare(`
    INSERT INTO subscriptions (
      id, number, customer_id, plan_id, start_date, expiry_date,
      payment_terms, status, next_billing_date
    ) VALUES (?, 'SUB-0002', 'usr-cust-2', ?, '2026-09-15', '2027-09-15', 'Due on receipt', 'Active', '2026-10-15')
  `).run(sub2Id, planMonthlyId);

  db.prepare(`
    INSERT INTO subscription_lines (id, subscription_id, product_id, variant_id, quantity, unit_price, tax_rate, amount)
    VALUES ('sl-3', ?, ?, NULL, 2, 1200.0, 0.18, 2400.0)
  `).run(sub2Id, p1Id);

  // 7. Seed Past Invoice & Partial Payment
  const inv1Id = 'inv-seed-1';
  db.prepare(`
    INSERT INTO invoices (
      id, number, subscription_id, period_start, period_end,
      subtotal, discount_total, tax_total, total, status, due_date
    ) VALUES (?, 'INV-0001', ?, '2026-09-15', '2026-10-15', 2400.0, 360.0, 367.2, 2407.2, 'Confirmed', '2026-09-29')
  `).run(inv1Id, sub2Id);

  db.prepare(`
    INSERT INTO invoice_lines (id, invoice_id, product_id, description, quantity, unit_price, amount)
    VALUES ('il-1', ?, ?, 'BrightERP Suite (monthly subscription)', 2, 1200.0, 2400.0)
  `).run(inv1Id, p1Id);

  // Partial Payment of 1000 recorded
  db.prepare(`
    INSERT INTO payments (id, invoice_id, method, amount, paid_on, note)
    VALUES ('pay-1', ?, 'Bank Transfer', 1000.0, '2026-09-20', 'Advance wire payment from Metro Retail')
  `).run(inv1Id);

  console.log('✅ Seeding completed successfully!');
  console.log('Connected Team Accounts:');
  console.log(' - Dipak Pal (Admin): dipak@brightloop.test / Dipak@1234');
  console.log(' - Shivam Yadav (Staff): shivam@brightloop.test / Shivam@1234');
  console.log(' - Vijay Sharma (Staff): vijay@brightloop.test / Vijay@1234');
  console.log(' - Anirudh Kumar (Staff): anirudh@brightloop.test / Anirudh@1234');
  console.log(' - Acme Customer: customer@brightloop.test / Customer@1234');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
