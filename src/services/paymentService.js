const crypto = require('node:crypto');
const { db } = require('../db/database');
const { getInvoiceById } = require('./invoiceService');

function recordPayment({ invoiceId, method, amount, paidOn = null, note = '' }) {
  const inv = getInvoiceById(invoiceId);
  if (!inv) throw new Error('Invoice not found.');

  if (inv.status === 'Cancelled') {
    throw new Error('Cannot record payment against a cancelled invoice.');
  }

  const paymentAmount = Number(amount);
  if (isNaN(paymentAmount) || paymentAmount <= 0) {
    throw new Error('Payment amount must be greater than zero.');
  }

  const paymentId = crypto.randomUUID();
  const date = paidOn || new Date().toISOString().split('T')[0];

  db.prepare(`
    INSERT INTO payments (id, invoice_id, method, amount, paid_on, note)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(paymentId, invoiceId, method, paymentAmount, date, note);

  // Recalculate total paid
  const totalPaidRow = db.prepare('SELECT SUM(amount) as paid FROM payments WHERE invoice_id = ?').get(invoiceId);
  const totalPaid = Number((totalPaidRow.paid || 0).toFixed(2));

  // If settled, auto-mark invoice as Paid
  if (totalPaid >= inv.total) {
    db.prepare("UPDATE invoices SET status = 'Paid' WHERE id = ?").run(invoiceId);
  } else if (inv.status === 'Draft') {
    db.prepare("UPDATE invoices SET status = 'Confirmed' WHERE id = ?").run(invoiceId);
  }

  return {
    paymentId,
    invoiceId,
    method,
    amount: paymentAmount,
    paidOn: date,
    totalPaid,
    invoiceTotal: inv.total,
    remainingBalance: Math.max(0, Number((inv.total - totalPaid).toFixed(2))),
    isFullyPaid: totalPaid >= inv.total
  };
}

function getAllPayments() {
  return db.prepare(`
    SELECT p.*, inv.number as invoice_number, u.name as customer_name
    FROM payments p
    JOIN invoices inv ON p.invoice_id = inv.id
    JOIN subscriptions s ON inv.subscription_id = s.id
    JOIN users u ON s.customer_id = u.id
    ORDER BY p.paid_on DESC, p.created_at DESC
  `).all();
}

module.exports = {
  recordPayment,
  getAllPayments
};
