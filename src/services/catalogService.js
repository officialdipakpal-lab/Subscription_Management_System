const crypto = require('node:crypto');
const { db } = require('../db/database');

function getAllProducts() {
  const products = db.prepare('SELECT * FROM products ORDER BY name ASC').all();
  return products.map(product => {
    const variants = db.prepare('SELECT * FROM variants WHERE product_id = ?').all(product.id);
    return { ...product, variants };
  });
}

function getProductById(id) {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) return null;
  const variants = db.prepare('SELECT * FROM variants WHERE product_id = ?').all(id);
  return { ...product, variants };
}

function createProduct({ name, type, sales_price, cost_price = 0, notes = '', variants = [] }) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO products (id, name, type, sales_price, cost_price, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name, type, Number(sales_price), Number(cost_price), notes);

  for (const v of variants) {
    const variantId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO variants (id, product_id, attribute, value, extra_price)
      VALUES (?, ?, ?, ?, ?)
    `).run(variantId, id, v.attribute, v.value, Number(v.extra_price || 0));
  }

  return getProductById(id);
}

function addVariant(productId, { attribute, value, extra_price = 0 }) {
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) throw new Error('Product not found');

  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO variants (id, product_id, attribute, value, extra_price)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, productId, attribute, value, Number(extra_price));

  return db.prepare('SELECT * FROM variants WHERE id = ?').get(id);
}

function getAllPlans() {
  return db.prepare('SELECT * FROM plans ORDER BY name ASC').all();
}

function getPlanById(id) {
  return db.prepare('SELECT * FROM plans WHERE id = ?').get(id);
}

function createPlan({
  name,
  price,
  period,
  min_qty = 1,
  available_from = null,
  available_to = null,
  auto_close = 0,
  closable = 1,
  pausable = 1,
  renewable = 1
}) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO plans (
      id, name, price, period, min_qty, available_from, available_to,
      auto_close, closable, pausable, renewable
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    name,
    Number(price),
    period,
    min_qty,
    available_from,
    available_to,
    auto_close ? 1 : 0,
    closable ? 1 : 0,
    pausable ? 1 : 0,
    renewable ? 1 : 0
  );

  return getPlanById(id);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  addVariant,
  getAllPlans,
  getPlanById,
  createPlan
};
