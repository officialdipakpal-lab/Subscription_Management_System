const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, '..', '..', 'data', 'brightloop.sqlite');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for durability and performance
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE COLLATE NOCASE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK(role IN ('Admin', 'Staff', 'Customer')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reset_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      sales_price REAL NOT NULL,
      cost_price REAL NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      attribute TEXT NOT NULL,
      value TEXT NOT NULL,
      extra_price REAL NOT NULL DEFAULT 0.0,
      FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      period TEXT CHECK(period IN ('daily', 'weekly', 'monthly', 'yearly')) NOT NULL,
      min_qty INTEGER DEFAULT 1,
      available_from TEXT,
      available_to TEXT,
      auto_close INTEGER DEFAULT 0,
      closable INTEGER DEFAULT 1,
      pausable INTEGER DEFAULT 1,
      renewable INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS quote_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      validity_days INTEGER DEFAULT 15,
      plan_id TEXT,
      FOREIGN KEY(plan_id) REFERENCES plans(id)
    );

    CREATE TABLE IF NOT EXISTS quote_template_lines (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      quantity INTEGER DEFAULT 1,
      unit_price REAL NOT NULL,
      FOREIGN KEY(template_id) REFERENCES quote_templates(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id),
      FOREIGN KEY(variant_id) REFERENCES variants(id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      expiry_date TEXT,
      payment_terms TEXT DEFAULT 'Due on receipt',
      status TEXT CHECK(status IN ('Draft', 'Quotation', 'Confirmed', 'Active', 'Paused', 'Closed')) NOT NULL DEFAULT 'Draft',
      next_billing_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(customer_id) REFERENCES users(id),
      FOREIGN KEY(plan_id) REFERENCES plans(id)
    );

    CREATE TABLE IF NOT EXISTS subscription_lines (
      id TEXT PRIMARY KEY,
      subscription_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      quantity INTEGER DEFAULT 1,
      unit_price REAL NOT NULL,
      tax_rate REAL DEFAULT 0.0,
      amount REAL NOT NULL,
      FOREIGN KEY(subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id),
      FOREIGN KEY(variant_id) REFERENCES variants(id)
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      subscription_id TEXT NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount_total REAL NOT NULL DEFAULT 0.0,
      tax_total REAL NOT NULL DEFAULT 0.0,
      total REAL NOT NULL,
      status TEXT CHECK(status IN ('Draft', 'Confirmed', 'Paid', 'Cancelled')) NOT NULL DEFAULT 'Draft',
      due_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(subscription_id) REFERENCES subscriptions(id),
      UNIQUE(subscription_id, period_start, period_end)
    );

    CREATE TABLE IF NOT EXISTS invoice_lines (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      product_id TEXT,
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY(invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      method TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_on TEXT NOT NULL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(invoice_id) REFERENCES invoices(id)
    );

    CREATE TABLE IF NOT EXISTS tax_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rate REAL NOT NULL,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS discount_rules (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      type TEXT CHECK(type IN ('fixed', 'percent')) NOT NULL,
      value REAL NOT NULL,
      min_amount REAL DEFAULT 0.0,
      min_qty INTEGER DEFAULT 1,
      starts_on TEXT,
      ends_on TEXT,
      usage_limit INTEGER DEFAULT 999999,
      used_count INTEGER DEFAULT 0,
      scope TEXT CHECK(scope IN ('subscription', 'product')) NOT NULL DEFAULT 'subscription',
      target_product_id TEXT,
      FOREIGN KEY(target_product_id) REFERENCES products(id)
    );

    -- Core Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);
    CREATE INDEX IF NOT EXISTS idx_subs_next_billing ON subscriptions(next_billing_date);
    CREATE INDEX IF NOT EXISTS idx_subs_customer ON subscriptions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_subs ON invoices(subscription_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
    CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(due_date);
    CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
  `);
}

initSchema();

module.exports = { db, initSchema };
