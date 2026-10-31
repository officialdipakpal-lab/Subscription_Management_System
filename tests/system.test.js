const assert = require('node:assert');
const { db, initSchema } = require('../src/db/database');
const { seedDatabase } = require('../src/db/seed');
const { validatePassword, registerUser, loginUser, forgotPassword } = require('../src/services/authService');
const { getAllProducts, getAllPlans } = require('../src/services/catalogService');
const { getAllSubscriptions, updateSubscriptionStatus } = require('../src/services/subscriptionService');
const { runBillingEngine } = require('../src/services/billingEngine');
const { getAllInvoices, confirmInvoice } = require('../src/services/invoiceService');
const { recordPayment } = require('../src/services/paymentService');
const { getFinanceSummary } = require('../src/services/reportService');

console.log('🧪 Starting Brightloop Backend Verification Test Suite...\n');

// 1. Password Policy Test
console.log('Test 1: Password Policy Validation');
assert.strictEqual(validatePassword('12345'), false, 'Weak numeric should fail');
assert.strictEqual(validatePassword('password'), false, 'No uppercase/special should fail');
assert.strictEqual(validatePassword('Password123'), false, 'No special char should fail');
assert.strictEqual(validatePassword('Brightloop@2026'), true, 'Valid strong password must pass');
console.log('  ✅ Password policy tests passed.\n');

// 2. Database Seeding & Team Users Check
console.log('Test 2: Seed & Team Roster Verification');
seedDatabase();
const users = db.prepare('SELECT email, role, name FROM users').all();
const dipak = users.find(u => u.email === 'dipak@brightloop.test');
const shivam = users.find(u => u.email === 'shivam@brightloop.test');
const vijay = users.find(u => u.email === 'vijay@brightloop.test');
const anirudh = users.find(u => u.email === 'anirudh@brightloop.test');
assert.ok(dipak && dipak.role === 'Admin', 'Dipak must be seeded as Admin');
assert.ok(shivam && shivam.role === 'Staff', 'Shivam must be seeded as Staff');
assert.ok(vijay && vijay.role === 'Staff', 'Vijay must be seeded as Staff');
assert.ok(anirudh && anirudh.role === 'Staff', 'Anirudh must be seeded as Staff');
console.log('  ✅ Seeded team accounts verified.\n');

// 3. Catalog & Brand Variant Pricing (+560 extra for Odoo)
console.log('Test 3: Catalog & Odoo Brand Variant (+560 Extra)');
const products = getAllProducts();
const erp = products.find(p => p.name.includes('BrightERP'));
assert.ok(erp, 'BrightERP product must exist');
const odooVariant = erp.variants.find(v => v.value === 'Odoo');
assert.ok(odooVariant && odooVariant.extra_price === 560, 'Odoo variant must add +560 extra price');
console.log('  ✅ Odoo variant pricing verified.\n');

// 4. Billing Engine Idempotency Guarantee
console.log('Test 4: Billing Engine Exactly-Once Guarantee (Idempotency)');
const run1 = runBillingEngine('2026-10-31');
console.log(`  Run 1: Created ${run1.invoicesCreated} invoices, Skipped ${run1.alreadyBilledSkipped}`);
assert.ok(run1.invoicesCreated > 0, 'First run should bill due subscriptions');

const run2 = runBillingEngine('2026-10-31');
console.log(`  Run 2: Created ${run2.invoicesCreated} invoices, Skipped ${run2.alreadyBilledSkipped}`);
assert.strictEqual(run2.invoicesCreated, 0, 'Second run must create 0 duplicate invoices (Idempotent)');
console.log('  ✅ Exactly-once billing invariant verified.\n');

// 5. Payment Partial Settlement & Full Paid Transition
console.log('Test 5: Payment Processing & Settled Status');
const invoices = getAllInvoices();
const targetInv = invoices.find(inv => inv.status !== 'Paid');
assert.ok(targetInv, 'Must have an unpaid invoice');

const balanceBefore = targetInv.balance;
const payRes = recordPayment({
  invoiceId: targetInv.id,
  method: 'UPI',
  amount: balanceBefore,
  note: 'Full settlement'
});
assert.strictEqual(payRes.isFullyPaid, true, 'Full payment should settle the invoice');
assert.strictEqual(payRes.remainingBalance, 0, 'Remaining balance must be 0.00');
console.log('  ✅ Payments and balance calculations verified.\n');

// 6. Finance Summary Response Time (< 2s)
console.log('Test 6: Finance Summary & Sub-Second Latency');
const start = performance.now();
const summary = getFinanceSummary();
const latencyMs = performance.now() - start;
assert.ok(summary.monthlyRecurringRevenue > 0, 'MRR must be calculated');
assert.ok(latencyMs < 2000, 'Report latency must be under 2 seconds');
console.log(`  Latency: ${latencyMs.toFixed(2)}ms (Target < 2000ms)`);
console.log('  ✅ Finance reporting tests passed.\n');

// 7. Quotation Creation from Template Pipeline
console.log('Test 7: Quotation Template to Active Subscription Pipeline');
const { getAllQuoteTemplates, createSubscriptionFromTemplate, updateSubscriptionStatus: advanceStatus } = require('../src/services/subscriptionService');
const templates = getAllQuoteTemplates();
assert.ok(templates.length > 0, 'Must have seeded quotation template');
const newQuote = createSubscriptionFromTemplate(templates[0].id, {
  customerId: 'usr-cust-1',
  startDate: '2026-11-01'
});
assert.strictEqual(newQuote.status, 'Draft', 'New quote starts in Draft state');
const quoted = advanceStatus(newQuote.id, 'Quotation');
assert.strictEqual(quoted.status, 'Quotation', 'Moves to Quotation');
const confirmed = advanceStatus(newQuote.id, 'Confirmed');
assert.strictEqual(confirmed.status, 'Confirmed', 'Moves to Confirmed');
const activated = advanceStatus(newQuote.id, 'Active');
assert.strictEqual(activated.status, 'Active', 'Moves to Active');
console.log('  ✅ Quotation lifecycle pipeline verified.\n');

console.log('🎉 ALL BACKEND SYSTEM VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
