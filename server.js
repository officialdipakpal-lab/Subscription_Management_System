const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { db } = require('./src/db/database');
const { seedDatabase } = require('./src/db/seed');
const { authenticate, requireRole } = require('./src/middleware/auth');
const authService = require('./src/services/authService');
const catalogService = require('./src/services/catalogService');
const subscriptionService = require('./src/services/subscriptionService');
const invoiceService = require('./src/services/invoiceService');
const billingEngine = require('./src/services/billingEngine');
const paymentService = require('./src/services/paymentService');
const discountTaxEngine = require('./src/services/discountTaxEngine');
const reportService = require('./src/services/reportService');

const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
if (userCount === 0) {
  seedDatabase();
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ======================== AUTH ROUTES ========================
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const userRole = role === 'Staff' ? 'Staff' : 'Customer';
    const result = authService.registerUser({ email, password, name, role: userRole });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const result = authService.loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    const result = authService.forgotPassword(email);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = authService.resetPassword(token, newPassword);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ======================== TEAM & STAFF ROUTES ========================
app.get('/api/team', (req, res) => {
  res.json({
    project: 'Brightloop Subscription Management System (Odoo Hackathon)',
    members: [
      { name: 'Dipak Pal', role: 'Team Lead / System Architect', email: 'dipak@brightloop.test', github: 'officialdipakpal-lab' },
      { name: 'Shivam Yadav', role: 'Full Stack Developer', email: 'shivam@brightloop.test', github: 'Shivam-Yadav7524' },
      { name: 'Vijay Sharma', role: 'Frontend & UI Portal Lead', email: 'vijay@brightloop.test' },
      { name: 'Anirudh Kumar', role: 'Backend & Database Systems Engineer', email: 'anirudh@brightloop.test' }
    ]
  });
});

app.get('/api/staff', authenticate, requireRole('Admin'), (req, res) => {
  const staff = db.prepare("SELECT id, email, name, role, created_at FROM users WHERE role = 'Staff'").all();
  res.json(staff);
});

app.get('/api/customers', authenticate, requireRole('Admin', 'Staff'), (req, res) => {
  const customers = db.prepare("SELECT id, email, name, role, created_at FROM users WHERE role = 'Customer' ORDER BY name ASC").all();
  res.json(customers);
});

app.post('/api/staff', authenticate, requireRole('Admin'), (req, res) => {
  try {
    const { email, password, name } = req.body;
    const result = authService.registerUser({ email, password, name, role: 'Staff' });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ======================== CATALOG ROUTES ========================
app.get('/api/products', (req, res) => {
  res.json(catalogService.getAllProducts());
});

app.post('/api/products', authenticate, requireRole('Admin'), (req, res) => {
  try {
    const product = catalogService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/products/:id/variants', authenticate, requireRole('Admin'), (req, res) => {
  try {
    const variant = catalogService.addVariant(req.params.id, req.body);
    res.status(201).json(variant);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/plans', (req, res) => {
  res.json(catalogService.getAllPlans());
});

app.post('/api/plans', authenticate, requireRole('Admin'), (req, res) => {
  try {
    const plan = catalogService.createPlan(req.body);
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ======================== QUOTES & TEMPLATES ========================
app.get('/api/quote-templates', authenticate, (req, res) => {
  res.json(subscriptionService.getAllQuoteTemplates());
});

app.post('/api/subscriptions/from-template/:templateId', authenticate, requireRole('Admin', 'Staff'), (req, res) => {
  try {
    const { customerId, startDate } = req.body;
    const sub = subscriptionService.createSubscriptionFromTemplate(req.params.templateId, { customerId, startDate });
    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ======================== SUBSCRIPTION ROUTES ========================
app.get('/api/subscriptions', authenticate, (req, res) => {
  const customerId = req.user.role === 'Customer' ? req.user.id : req.query.customerId;
  const status = req.query.status;
  res.json(subscriptionService.getAllSubscriptions({ customerId, status }));
});

app.get('/api/subscriptions/:id', authenticate, (req, res) => {
  const sub = subscriptionService.getSubscriptionById(req.params.id);
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });
  if (req.user.role === 'Customer' && sub.customer_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  res.json(sub);
});

app.post('/api/subscriptions', authenticate, requireRole('Admin', 'Staff'), (req, res) => {
  try {
    const sub = subscriptionService.createSubscription(req.body);
    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/subscriptions/:id/status', authenticate, requireRole('Admin', 'Staff'), (req, res) => {
  try {
    const { status } = req.body;
    const sub = subscriptionService.updateSubscriptionStatus(req.params.id, status, req.user);
    res.json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/subscriptions/:id/pause', authenticate, (req, res) => {
  try {
    const sub = subscriptionService.pauseSubscription(req.params.id, req.user);
    res.json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/subscriptions/:id/resume', authenticate, (req, res) => {
  try {
    const sub = subscriptionService.resumeSubscription(req.params.id, req.user);
    res.json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/subscriptions/:id/renew', authenticate, (req, res) => {
  try {
    const sub = subscriptionService.renewSubscription(req.params.id, req.user);
    res.json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/subscriptions/:id/close', authenticate, (req, res) => {
  try {
    const sub = subscriptionService.closeSubscription(req.params.id, req.user);
    res.json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ======================== INVOICE ROUTES ========================
app.get('/api/invoices', authenticate, (req, res) => {
  const customerId = req.user.role === 'Customer' ? req.user.id : req.query.customerId;
  const status = req.query.status;
  res.json(invoiceService.getAllInvoices({ customerId, status }));
});

app.get('/api/invoices/:id', authenticate, (req, res) => {
  const inv = invoiceService.getInvoiceById(req.params.id);
  if (!inv) return res.status(404).json({ error: 'Invoice not found' });
  if (req.user.role === 'Customer' && inv.customer_email !== req.user.email) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  res.json(inv);
});

app.post('/api/invoices/:id/confirm', authenticate, requireRole('Admin', 'Staff'), (req, res) => {
  try {
    const inv = invoiceService.confirmInvoice(req.params.id);
    res.json(inv);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/invoices/:id/cancel', authenticate, requireRole('Admin', 'Staff'), (req, res) => {
  try {
    const inv = invoiceService.cancelInvoice(req.params.id);
    res.json(inv);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/invoices/:id/send', authenticate, requireRole('Admin', 'Staff'), (req, res) => {
  try {
    const result = invoiceService.sendInvoice(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ======================== BILLING ENGINE ROUTE ========================
app.post('/api/billing/run', authenticate, requireRole('Admin'), (req, res) => {
  try {
    const results = billingEngine.runBillingEngine(req.body.date);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================== PAYMENTS ========================
app.get('/api/payments', authenticate, requireRole('Admin', 'Staff'), (req, res) => {
  res.json(paymentService.getAllPayments());
});

app.post('/api/invoices/:id/payments', authenticate, (req, res) => {
  try {
    const inv = invoiceService.getInvoiceById(req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });

    // Customer can only pay their own invoices; Admin and Staff can record for any
    if (req.user.role === 'Customer' && inv.customer_email !== req.user.email) {
      return res.status(403).json({ error: 'Access denied: You can only pay your own invoices.' });
    }

    const { method, amount, paidOn, note } = req.body;
    const result = paymentService.recordPayment({
      invoiceId: req.params.id,
      method,
      amount,
      paidOn,
      note
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ======================== TAXES & DISCOUNTS ========================
app.get('/api/taxes', (req, res) => {
  res.json(discountTaxEngine.getAllTaxes());
});

app.post('/api/taxes', authenticate, requireRole('Admin'), (req, res) => {
  try {
    const tax = discountTaxEngine.createTaxRule(req.body);
    res.status(201).json(tax);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/discounts', (req, res) => {
  res.json(discountTaxEngine.getAllDiscounts());
});

app.post('/api/discounts', authenticate, requireRole('Admin'), (req, res) => {
  try {
    const discount = discountTaxEngine.createDiscountRule(req.body);
    res.status(201).json(discount);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ======================== REPORTS ========================
app.get('/api/reports/summary', authenticate, (req, res) => {
  res.json(reportService.getFinanceSummary());
});

app.get('/api/reports/overdue', authenticate, requireRole('Admin', 'Staff'), (req, res) => {
  res.json(reportService.getOverdueInvoices());
});

app.get('/api/reports/export-csv', authenticate, requireRole('Admin', 'Staff'), (req, res) => {
  const csv = reportService.exportCsv();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="brightloop_finance_report.csv"');
  res.send(csv);
});

// Fallback to SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Brightloop Subscription Management System is ONLINE!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
