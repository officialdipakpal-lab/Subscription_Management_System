const crypto = require('node:crypto');
const { db } = require('../db/database');

function generateInvoiceNumber() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM invoices').get();
  const nextNum = (countRow.count || 0) + 1;
  return `INV-${String(nextNum).padStart(4, '0')}`;
}

function getAllInvoices({ customerId = null, status = null } = {}) {
  let query = `
    SELECT inv.*, s.number as subscription_number, u.name as customer_name, u.email as customer_email,
           (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = inv.id) as amount_paid
    FROM invoices inv
    JOIN subscriptions s ON inv.subscription_id = s.id
    JOIN users u ON s.customer_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (customerId) {
    query += ' AND s.customer_id = ?';
    params.push(customerId);
  }

  if (status) {
    query += ' AND inv.status = ?';
    params.push(status);
  }

  query += ' ORDER BY inv.created_at DESC';

  const rows = db.prepare(query).all(...params);
  return rows.map(inv => {
    const lines = db.prepare('SELECT * FROM invoice_lines WHERE invoice_id = ?').all(inv.id);
    const balance = Number((inv.total - inv.amount_paid).toFixed(2));
    return { ...inv, lines, balance };
  });
}

function getInvoiceById(id) {
  const inv = db.prepare(`
    SELECT inv.*, s.number as subscription_number, u.name as customer_name, u.email as customer_email,
           (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = inv.id) as amount_paid
    FROM invoices inv
    JOIN subscriptions s ON inv.subscription_id = s.id
    JOIN users u ON s.customer_id = u.id
    WHERE inv.id = ?
  `).get(id);

  if (!inv) return null;

  const lines = db.prepare('SELECT * FROM invoice_lines WHERE invoice_id = ?').all(id);
  const payments = db.prepare('SELECT * FROM payments WHERE invoice_id = ? ORDER BY paid_on DESC').all(id);
  const balance = Number((inv.total - inv.amount_paid).toFixed(2));

  return { ...inv, lines, payments, balance };
}

// Invoice state machine: Draft -> Confirmed -> Paid (or Cancelled)
function confirmInvoice(id) {
  const inv = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  if (!inv) throw new Error('Invoice not found.');
  if (inv.status !== 'Draft') {
    throw new Error(`Only Draft invoices can be confirmed. Current status: ${inv.status}`);
  }

  db.prepare("UPDATE invoices SET status = 'Confirmed' WHERE id = ?").run(id);
  return getInvoiceById(id);
}

function cancelInvoice(id) {
  const inv = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  if (!inv) throw new Error('Invoice not found.');
  if (inv.status === 'Paid') {
    throw new Error('Paid invoices cannot be cancelled.');
  }

  db.prepare("UPDATE invoices SET status = 'Cancelled' WHERE id = ?").run(id);
  return getInvoiceById(id);
}

function sendInvoice(id) {
  const inv = getInvoiceById(id);
  if (!inv) throw new Error('Invoice not found.');

  // Simulates email notification sending
  return {
    success: true,
    message: `Invoice ${inv.number} has been emailed to ${inv.customer_email}.`,
    invoiceNumber: inv.number,
    recipient: inv.customer_email
  };
}

module.exports = {
  generateInvoiceNumber,
  getAllInvoices,
  getInvoiceById,
  confirmInvoice,
  cancelInvoice,
  sendInvoice
};
