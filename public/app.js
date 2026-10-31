let currentUser = null;
let currentToken = null;
let currentTab = 'dashboard';
let cachedQuoteTemplates = [];
let cachedCustomers = [];

// Initialize app with Lead Admin Dipak Pal
async function initApp() {
  await switchUser('dipak@brightloop.test', 'Dipak@1234');
}

// Switch User & Enforce Role-Based UI
async function switchUser(email, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    currentUser = data;
    currentToken = data.token;

    // Update Top User Status UI
    document.getElementById('current-user-name').innerText = data.name;
    document.getElementById('current-user-role').innerText = data.role;
    document.getElementById('current-user-email').innerText = data.email;
    document.getElementById('user-avatar').innerText = data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Update user switch button highlights
    document.querySelectorAll('.user-btn').forEach(btn => {
      btn.classList.remove('bg-indigo-600', 'text-white');
      btn.classList.add('bg-indigo-800/80', 'text-indigo-200');
    });
    const activeBtn = Array.from(document.querySelectorAll('.user-btn')).find(b => b.innerText.toLowerCase().includes(data.name.split(' ')[0].toLowerCase()));
    if (activeBtn) {
      activeBtn.classList.add('bg-indigo-600', 'text-white');
      activeBtn.classList.remove('bg-indigo-800/80', 'text-indigo-200');
    }

    // Adapt UI according to Role (Admin vs Staff vs Customer)
    applyRolePermissions(data.role);

    // Refresh view
    refreshCurrentView();
  } catch (err) {
    alert('Login error: ' + err.message);
  }
}

function applyRolePermissions(role) {
  const customerBanner = document.getElementById('customer-portal-banner');
  const tabDashboard = document.getElementById('tab-dashboard');
  const tabBilling = document.getElementById('tab-billing');
  const tabCatalog = document.getElementById('tab-catalog');
  const tabStaff = document.getElementById('tab-staff');
  const catalogAdminButtons = document.getElementById('catalog-admin-buttons');
  const btnNewQuote = document.getElementById('btn-new-quote');
  const labelSubs = document.getElementById('label-subscriptions');
  const labelInvs = document.getElementById('label-invoices');
  const subPageTitle = document.getElementById('sub-page-title');
  const invPageTitle = document.getElementById('inv-page-title');
  const btnExportCsv = document.getElementById('btn-export-csv');

  if (role === 'Customer') {
    if (customerBanner) customerBanner.classList.remove('hidden');
    if (tabDashboard) tabDashboard.classList.add('hidden');
    if (tabBilling) tabBilling.classList.add('hidden');
    if (tabCatalog) tabCatalog.classList.add('hidden');
    if (tabStaff) tabStaff.classList.add('hidden');
    if (btnExportCsv) btnExportCsv.classList.add('hidden');
    if (btnNewQuote) btnNewQuote.classList.add('hidden');

    labelSubs.innerText = 'My Subscriptions';
    labelInvs.innerText = 'My Invoices';
    subPageTitle.innerText = 'My Active Subscriptions';
    invPageTitle.innerText = 'My Invoices & Payment History';

    if (currentTab === 'dashboard' || currentTab === 'billing' || currentTab === 'catalog' || currentTab === 'staff') {
      setTab('subscriptions');
    }
  } else if (role === 'Staff') {
    if (customerBanner) customerBanner.classList.add('hidden');
    if (tabDashboard) tabDashboard.classList.remove('hidden');
    if (tabBilling) tabBilling.classList.add('hidden'); // Billing Engine is Admin-only
    if (tabCatalog) tabCatalog.classList.remove('hidden');
    if (tabStaff) tabStaff.classList.add('hidden'); // Staff creation is Admin-only
    if (catalogAdminButtons) catalogAdminButtons.classList.add('hidden'); // Catalog edit is Admin-only
    if (btnExportCsv) btnExportCsv.classList.remove('hidden');
    if (btnNewQuote) btnNewQuote.classList.remove('hidden');

    labelSubs.innerText = 'Subscriptions & Quotes';
    labelInvs.innerText = 'Invoices & Payments';
    subPageTitle.innerText = 'Subscriptions & Quotations';
    invPageTitle.innerText = 'Invoices & Payment Reconciliation';

    if (currentTab === 'billing' || currentTab === 'staff') {
      setTab('dashboard');
    }
  } else {
    // Admin (Dipak Pal)
    if (customerBanner) customerBanner.classList.add('hidden');
    if (tabDashboard) tabDashboard.classList.remove('hidden');
    if (tabBilling) tabBilling.classList.remove('hidden');
    if (tabCatalog) tabCatalog.classList.remove('hidden');
    if (tabStaff) tabStaff.classList.remove('hidden');
    if (catalogAdminButtons) catalogAdminButtons.classList.remove('hidden');
    if (btnExportCsv) btnExportCsv.classList.remove('hidden');
    if (btnNewQuote) btnNewQuote.classList.remove('hidden');

    labelSubs.innerText = 'Subscriptions & Quotes';
    labelInvs.innerText = 'Invoices & Payments';
    subPageTitle.innerText = 'Subscriptions & Quotations';
    invPageTitle.innerText = 'Invoices & Payment Reconciliation';
  }
}

function setTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-indigo-50', 'text-indigo-700', 'border-indigo-200', 'font-semibold');
    btn.classList.add('text-slate-600', 'font-medium');
  });

  const activeTab = document.getElementById(`tab-${tabName}`);
  if (activeTab) {
    activeTab.classList.add('bg-indigo-50', 'text-indigo-700', 'border-indigo-200', 'font-semibold');
    activeTab.classList.remove('text-slate-600', 'font-medium');
  }

  document.querySelectorAll('.tab-content').forEach(view => {
    view.classList.add('hidden');
  });

  const targetView = document.getElementById(`view-${tabName}`);
  if (targetView) targetView.classList.remove('hidden');

  refreshCurrentView();
}

function refreshCurrentView() {
  if (currentUser && currentUser.role !== 'Customer') {
    loadDashboard();
  }
  loadSubscriptions();
  loadInvoices();
  loadCatalog();
  if (currentUser && currentUser.role === 'Admin') {
    loadStaff();
  }
}

// ======================== DASHBOARD ========================
async function loadDashboard() {
  try {
    const res = await fetch('/api/reports/summary', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const summary = await res.json();

    document.getElementById('metric-active-subs').innerText = summary.activeSubscriptionsCount;
    document.getElementById('metric-mrr').innerText = `₹${summary.monthlyRecurringRevenue.toLocaleString('en-IN')}`;
    document.getElementById('metric-collected').innerText = `₹${summary.revenueCollected.toLocaleString('en-IN')}`;
    document.getElementById('metric-outstanding').innerText = `₹${summary.totalOutstanding.toLocaleString('en-IN')}`;
    document.getElementById('metric-overdue-count').innerText = summary.overdueInvoicesCount;

    // Load Overdue Table
    const overdueRes = await fetch('/api/reports/overdue', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const overdueInvoices = await overdueRes.json();
    const tableBody = document.getElementById('table-overdue-body');

    if (!overdueInvoices || overdueInvoices.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-emerald-600 font-medium"><i class="fa fa-check-circle mr-1"></i> No overdue invoices! All cash flows are healthy.</td></tr>`;
    } else {
      tableBody.innerHTML = overdueInvoices.map(inv => `
        <tr class="hover:bg-slate-50">
          <td class="p-3 font-bold text-slate-800">
            <button onclick="openInvoiceModal('${inv.id}')" class="text-indigo-600 hover:underline">${inv.number}</button>
          </td>
          <td class="p-3">${inv.customer_name}</td>
          <td class="p-3 text-red-600 font-semibold">${inv.due_date}</td>
          <td class="p-3 font-medium">₹${inv.total.toFixed(2)}</td>
          <td class="p-3 font-bold text-red-600">₹${inv.balance.toFixed(2)}</td>
          <td class="p-3"><span class="px-2 py-0.5 text-xs font-semibold rounded-full badge-overdue">Overdue</span></td>
          <td class="p-3 text-right">
            <button onclick="openPaymentModal('${inv.id}', '${inv.number}', ${inv.balance})" class="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100">
              Collect Payment
            </button>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

// ======================== BILLING ENGINE ========================
async function triggerBillingRun() {
  const btn = document.getElementById('btn-run-billing');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa fa-spinner fa-spin mr-1"></i> Processing Billing Batch...';

  try {
    const res = await fetch('/api/billing/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ date: new Date().toISOString().split('T')[0] })
    });

    const data = await res.json();
    const resultCard = document.getElementById('billing-result-card');
    resultCard.classList.remove('hidden');

    const summaryContainer = document.getElementById('billing-result-summary');
    summaryContainer.innerHTML = `
      <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
        <p class="text-xs text-indigo-600 font-bold uppercase">Subscriptions Due</p>
        <p class="text-2xl font-extrabold text-indigo-900 mt-1">${data.dueSubscriptionsFound}</p>
      </div>
      <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
        <p class="text-xs text-emerald-600 font-bold uppercase">Invoices Created</p>
        <p class="text-2xl font-extrabold text-emerald-900 mt-1">${data.invoicesCreated}</p>
      </div>
      <div class="bg-amber-50 p-4 rounded-xl border border-amber-100">
        <p class="text-xs text-amber-600 font-bold uppercase">Skipped (Idempotent)</p>
        <p class="text-2xl font-extrabold text-amber-900 mt-1">${data.alreadyBilledSkipped}</p>
      </div>
      <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <p class="text-xs text-slate-500 font-bold uppercase">Auto-Closed (Expiry)</p>
        <p class="text-2xl font-extrabold text-slate-900 mt-1">${data.closedDueToExpiry}</p>
      </div>
    `;

    const invoicesContainer = document.getElementById('billing-invoices-container');
    if (data.invoices && data.invoices.length > 0) {
      invoicesContainer.innerHTML = data.invoices.map(inv => `
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-sm">
          <div>
            <span class="font-bold text-indigo-700">${inv.invoiceNumber}</span> &bull; 
            <span class="font-medium">${inv.customer}</span> &bull; 
            <span class="text-xs text-slate-500">Period: ${inv.periodStart} to ${inv.periodEnd}</span>
          </div>
          <span class="font-bold text-emerald-700">₹${inv.total.toFixed(2)}</span>
        </div>
      `).join('');
    } else {
      invoicesContainer.innerHTML = `
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 italic">
          No new invoices generated in this run. Zero duplicates created due to idempotency constraint.
        </div>
      `;
    }

    refreshCurrentView();
  } catch (err) {
    alert('Billing execution failed: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-play text-amber-600"></i> Run Billing Engine Today';
  }
}

// ======================== SUBSCRIPTIONS ========================
async function loadSubscriptions() {
  try {
    const statusFilter = document.getElementById('filter-sub-status').value;
    let url = '/api/subscriptions';
    if (statusFilter) url += `?status=${encodeURIComponent(statusFilter)}`;

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const subscriptions = await res.json();
    const tableBody = document.getElementById('table-subscriptions-body');

    if (!subscriptions || subscriptions.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-slate-400">No subscriptions found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = subscriptions.map(sub => {
      const badgeClass = `badge-${sub.status.toLowerCase()}`;
      return `
        <tr class="hover:bg-slate-50">
          <td class="p-3 font-bold text-slate-900">${sub.number}</td>
          <td class="p-3">
            <div class="font-medium text-slate-800">${sub.customer_name}</div>
            <div class="text-xs text-slate-400">${sub.customer_email}</div>
          </td>
          <td class="p-3 font-medium">${sub.plan_name}</td>
          <td class="p-3 text-xs uppercase font-semibold text-slate-500">${sub.plan_period}</td>
          <td class="p-3 text-xs font-mono text-slate-700">${sub.next_billing_date || '--'}</td>
          <td class="p-3"><span class="px-2 py-0.5 text-xs font-semibold rounded-full ${badgeClass}">${sub.status}</span></td>
          <td class="p-3 text-right space-x-1">
            ${sub.status === 'Active' ? `
              <button onclick="subAction('${sub.id}', 'pause')" class="px-2 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100" title="Pause billing">Pause</button>
              <button onclick="subAction('${sub.id}', 'renew')" class="px-2 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100" title="Renew for next period">Renew</button>
              <button onclick="subAction('${sub.id}', 'close')" class="px-2 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100" title="Close subscription">Close</button>
            ` : ''}
            ${sub.status === 'Paused' ? `
              <button onclick="subAction('${sub.id}', 'resume')" class="px-2 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100">Resume</button>
              <button onclick="subAction('${sub.id}', 'close')" class="px-2 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100">Close</button>
            ` : ''}
            ${sub.status === 'Draft' && currentUser.role !== 'Customer' ? `
              <button onclick="subStatus('${sub.id}', 'Quotation')" class="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100">Send Quote</button>
            ` : ''}
            ${sub.status === 'Quotation' && currentUser.role !== 'Customer' ? `
              <button onclick="subStatus('${sub.id}', 'Confirmed')" class="px-2 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100">Confirm Quote</button>
            ` : ''}
            ${sub.status === 'Confirmed' && currentUser.role !== 'Customer' ? `
              <button onclick="subStatus('${sub.id}', 'Active')" class="px-2 py-1 text-xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700">Activate Plan</button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Subscriptions load error:', err);
  }
}

async function subAction(id, action) {
  try {
    const res = await fetch(`/api/subscriptions/${id}/${action}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    loadSubscriptions();
  } catch (err) {
    alert(err.message);
  }
}

async function subStatus(id, status) {
  try {
    const res = await fetch(`/api/subscriptions/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    loadSubscriptions();
  } catch (err) {
    alert(err.message);
  }
}

// ======================== QUOTE CREATION MODAL ========================
async function openCreateQuoteModal() {
  try {
    const [tplRes, custRes] = await Promise.all([
      fetch('/api/quote-templates', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
      fetch('/api/customers', { headers: { 'Authorization': `Bearer ${currentToken}` } })
    ]);

    cachedQuoteTemplates = await tplRes.json();
    cachedCustomers = await custRes.json();

    const tplSelect = document.getElementById('quote-template-select');
    tplSelect.innerHTML = cachedQuoteTemplates.map(t => `
      <option value="${t.id}">${t.name} (${t.plan_name} - ${t.validity_days} days validity)</option>
    `).join('');

    const custSelect = document.getElementById('quote-customer-select');
    custSelect.innerHTML = cachedCustomers.map(c => `
      <option value="${c.id}">${c.name} (${c.email})</option>
    `).join('');

    document.getElementById('quote-start-date').value = new Date().toISOString().split('T')[0];
    previewTemplateSelection();
    document.getElementById('quote-modal').classList.remove('hidden');
  } catch (err) {
    alert('Failed to load templates or customers: ' + err.message);
  }
}

function previewTemplateSelection() {
  const tplId = document.getElementById('quote-template-select').value;
  const template = cachedQuoteTemplates.find(t => t.id === tplId);
  const previewDiv = document.getElementById('quote-template-preview');

  if (!template) {
    previewDiv.innerHTML = 'Select a template to view details.';
    return;
  }

  let linesHtml = template.lines.map(l => `
    <div class="flex justify-between text-slate-700">
      <span>&bull; ${l.product_name} ${l.variant_val ? `(${l.variant_attr}: ${l.variant_val})` : ''} &times; ${l.quantity}</span>
      <span class="font-mono font-medium">₹${(l.unit_price * l.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  previewDiv.innerHTML = `
    <p class="font-bold text-slate-800">Plan: ${template.plan_name} (${template.plan_period})</p>
    <div class="mt-1 space-y-1">${linesHtml}</div>
    <p class="text-[11px] text-slate-500 mt-2">Validity: ${template.validity_days} days from start date</p>
  `;
}

function closeCreateQuoteModal() {
  document.getElementById('quote-modal').classList.add('hidden');
}

async function submitCreateQuote(e) {
  e.preventDefault();
  const templateId = document.getElementById('quote-template-select').value;
  const customerId = document.getElementById('quote-customer-select').value;
  const startDate = document.getElementById('quote-start-date').value;

  try {
    const res = await fetch(`/api/subscriptions/from-template/${templateId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ customerId, startDate })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    alert(`✅ Quotation ${data.number} created successfully! Moving to Quotations tab.`);
    closeCreateQuoteModal();
    setTab('subscriptions');
    loadSubscriptions();
  } catch (err) {
    alert('Error creating quotation: ' + err.message);
  }
}

// ======================== INVOICES ========================
async function loadInvoices() {
  try {
    const statusFilter = document.getElementById('filter-inv-status').value;
    let url = '/api/invoices';
    if (statusFilter) url += `?status=${encodeURIComponent(statusFilter)}`;

    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const invoices = await res.json();
    const tableBody = document.getElementById('table-invoices-body');

    if (!invoices || invoices.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="10" class="p-4 text-center text-slate-400">No invoices generated yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = invoices.map(inv => {
      const badgeClass = `badge-${inv.status.toLowerCase()}`;
      return `
        <tr class="hover:bg-slate-50">
          <td class="p-3 font-bold text-slate-900">
            <button onclick="openInvoiceModal('${inv.id}')" class="text-indigo-600 hover:underline font-bold" title="Click to view & print">${inv.number}</button>
          </td>
          <td class="p-3">
            <div class="font-medium text-slate-800">${inv.customer_name}</div>
            <div class="text-xs text-slate-400">${inv.customer_email}</div>
          </td>
          <td class="p-3 text-xs text-slate-600">${inv.period_start} &rarr; ${inv.period_end}</td>
          <td class="p-3 text-xs font-mono">₹${inv.subtotal.toFixed(2)}</td>
          <td class="p-3 text-xs font-mono text-emerald-600">-₹${inv.discount_total.toFixed(2)}</td>
          <td class="p-3 text-xs font-mono text-slate-500">₹${inv.tax_total.toFixed(2)}</td>
          <td class="p-3 font-bold text-slate-900">₹${inv.total.toFixed(2)}</td>
          <td class="p-3 text-xs">
            <div class="text-emerald-700 font-semibold">₹${inv.amount_paid.toFixed(2)} paid</div>
            <div class="${inv.balance > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}">₹${inv.balance.toFixed(2)} balance</div>
          </td>
          <td class="p-3"><span class="px-2 py-0.5 text-xs font-semibold rounded-full ${badgeClass}">${inv.status}</span></td>
          <td class="p-3 text-right space-x-1">
            <button onclick="openInvoiceModal('${inv.id}')" class="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded hover:bg-slate-200" title="View & Print">
              <i class="fa fa-eye"></i> View
            </button>
            ${inv.status === 'Draft' && currentUser.role !== 'Customer' ? `
              <button onclick="confirmInvoice('${inv.id}')" class="px-2 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded hover:bg-indigo-100">Confirm</button>
            ` : ''}
            ${(inv.status === 'Draft' || inv.status === 'Confirmed') && currentUser.role !== 'Customer' ? `
              <button onclick="cancelInvoice('${inv.id}')" class="px-2 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100">Cancel</button>
            ` : ''}
            ${inv.status !== 'Paid' && inv.status !== 'Cancelled' ? `
              <button onclick="openPaymentModal('${inv.id}', '${inv.number}', ${inv.balance})" class="px-2 py-1 text-xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700">Pay</button>
            ` : ''}
            ${currentUser.role !== 'Customer' ? `
              <button onclick="sendInvoiceEmail('${inv.id}')" class="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200" title="Email invoice to customer"><i class="fa fa-paper-plane"></i></button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Invoices load error:', err);
  }
}

// View & Print Invoice Modal
async function openInvoiceModal(invoiceId) {
  try {
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const inv = await res.json();
    if (!res.ok) throw new Error(inv.error);

    document.getElementById('modal-inv-number').innerText = inv.number;
    document.getElementById('modal-inv-customer-name').innerText = inv.customer_name;
    document.getElementById('modal-inv-customer-email').innerText = inv.customer_email;
    document.getElementById('modal-inv-period').innerText = `${inv.period_start} to ${inv.period_end}`;
    document.getElementById('modal-inv-due-date').innerText = inv.due_date;
    document.getElementById('modal-inv-sub-num').innerText = inv.subscription_number;

    const badgeClass = `badge-${inv.status.toLowerCase()}`;
    document.getElementById('modal-inv-status-pill').innerHTML = `
      <span class="px-3 py-1 text-xs font-bold rounded-full ${badgeClass}">${inv.status.toUpperCase()}</span>
    `;

    // Lines Table
    const linesBody = document.getElementById('modal-inv-lines');
    linesBody.innerHTML = inv.lines.map(line => `
      <tr>
        <td class="p-2.5 font-medium">${line.description}</td>
        <td class="p-2.5 text-center">${line.quantity}</td>
        <td class="p-2.5 text-right font-mono">₹${line.unit_price.toFixed(2)}</td>
        <td class="p-2.5 text-right font-mono font-bold">₹${line.amount.toFixed(2)}</td>
      </tr>
    `).join('');

    // Totals
    document.getElementById('modal-inv-subtotal').innerText = `₹${inv.subtotal.toFixed(2)}`;
    document.getElementById('modal-inv-discount').innerText = `-₹${inv.discount_total.toFixed(2)}`;
    document.getElementById('modal-inv-tax').innerText = `₹${inv.tax_total.toFixed(2)}`;
    document.getElementById('modal-inv-total').innerText = `₹${inv.total.toFixed(2)}`;
    document.getElementById('modal-inv-paid').innerText = `₹${inv.amount_paid.toFixed(2)}`;
    document.getElementById('modal-inv-balance').innerText = `₹${inv.balance.toFixed(2)}`;

    // Recorded Payments
    const payList = document.getElementById('modal-inv-payments-list');
    if (inv.payments && inv.payments.length > 0) {
      payList.innerHTML = inv.payments.map(p => `
        <div class="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200">
          <div>
            <span class="font-bold text-slate-800">${p.method}</span> &bull; 
            <span class="text-slate-500">${p.paid_on}</span>
            ${p.note ? `<span class="italic text-slate-400">(${p.note})</span>` : ''}
          </div>
          <span class="font-mono font-bold text-emerald-700">₹${p.amount.toFixed(2)}</span>
        </div>
      `).join('');
    } else {
      payList.innerHTML = `<p class="text-slate-400 italic">No payments recorded yet.</p>`;
    }

    // Modal Left Actions
    const leftActions = document.getElementById('modal-inv-actions-left');
    let actionsHtml = '';
    if (inv.status === 'Draft' && currentUser.role !== 'Customer') {
      actionsHtml += `<button onclick="confirmInvoice('${inv.id}'); closeInvoiceModal();" class="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Confirm Invoice</button>`;
    }
    if ((inv.status === 'Draft' || inv.status === 'Confirmed') && currentUser.role !== 'Customer') {
      actionsHtml += `<button onclick="cancelInvoice('${inv.id}'); closeInvoiceModal();" class="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Cancel Invoice</button>`;
    }
    if (inv.status !== 'Paid' && inv.status !== 'Cancelled') {
      actionsHtml += `<button onclick="closeInvoiceModal(); openPaymentModal('${inv.id}', '${inv.number}', ${inv.balance});" class="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Pay Balance (₹${inv.balance.toFixed(2)})</button>`;
    }
    leftActions.innerHTML = actionsHtml;

    document.getElementById('invoice-view-modal').classList.remove('hidden');
  } catch (err) {
    alert('Failed to view invoice: ' + err.message);
  }
}

function closeInvoiceModal() {
  document.getElementById('invoice-view-modal').classList.add('hidden');
}

async function confirmInvoice(id) {
  try {
    const res = await fetch(`/api/invoices/${id}/confirm`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    loadInvoices();
  } catch (err) {
    alert(err.message);
  }
}

async function cancelInvoice(id) {
  if (!confirm('Are you sure you want to cancel this invoice?')) return;
  try {
    const res = await fetch(`/api/invoices/${id}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    loadInvoices();
  } catch (err) {
    alert(err.message);
  }
}

async function sendInvoiceEmail(id) {
  try {
    const res = await fetch(`/api/invoices/${id}/send`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    alert('✉️ ' + data.message);
  } catch (err) {
    alert(err.message);
  }
}

// ======================== PAYMENTS MODAL ========================
function openPaymentModal(invoiceId, invoiceNumber, balance) {
  document.getElementById('pay-invoice-id').value = invoiceId;
  document.getElementById('pay-invoice-number').value = invoiceNumber;
  document.getElementById('pay-balance').value = `₹${balance.toFixed(2)}`;
  document.getElementById('pay-amount').value = balance.toFixed(2);
  document.getElementById('pay-amount').max = balance;
  document.getElementById('payment-modal').classList.remove('hidden');
}

function closePaymentModal() {
  document.getElementById('payment-modal').classList.add('hidden');
}

async function submitPayment(e) {
  e.preventDefault();
  const invoiceId = document.getElementById('pay-invoice-id').value;
  const method = document.getElementById('pay-method').value;
  const amount = document.getElementById('pay-amount').value;
  const note = document.getElementById('pay-note').value;

  try {
    const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ method, amount, note })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    alert(`✅ Payment of ₹${data.amount} recorded successfully via ${data.method}!`);
    closePaymentModal();
    refreshCurrentView();
  } catch (err) {
    alert('Payment error: ' + err.message);
  }
}

// ======================== CATALOG, PLANS & RULES ========================
async function loadCatalog() {
  try {
    const [pRes, plRes, tRes, dRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/plans'),
      fetch('/api/taxes'),
      fetch('/api/discounts')
    ]);

    const products = await pRes.json();
    const plans = await plRes.json();
    const taxes = await tRes.json();
    const discounts = await dRes.json();

    // Render Products
    document.getElementById('catalog-products-list').innerHTML = products.map(p => `
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div class="flex justify-between items-start">
          <span class="font-bold text-slate-900">${p.name}</span>
          <span class="font-extrabold text-indigo-700">₹${p.sales_price}</span>
        </div>
        <p class="text-xs text-slate-500 mt-1">${p.notes || ''}</p>
        ${p.variants && p.variants.length > 0 ? `
          <div class="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
            ${p.variants.map(v => `
              <span class="px-2 py-0.5 text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md">
                ${v.attribute}: <strong>${v.value}</strong> (+₹${v.extra_price})
              </span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');

    // Render Plans
    document.getElementById('catalog-plans-list').innerHTML = plans.map(pl => `
      <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div class="flex justify-between items-start">
          <div>
            <span class="font-bold text-slate-900">${pl.name}</span>
            <span class="ml-2 text-xs uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">${pl.period}</span>
          </div>
          <span class="font-extrabold text-amber-700">₹${pl.price}</span>
        </div>
        <div class="mt-2 text-xs flex gap-3 text-slate-500">
          <span>Auto-Close: ${pl.auto_close ? '✅' : '❌'}</span>
          <span>Pausable: ${pl.pausable ? '✅' : '❌'}</span>
          <span>Renewable: ${pl.renewable ? '✅' : '❌'}</span>
        </div>
      </div>
    `).join('');

    // Render Taxes
    document.getElementById('catalog-taxes-list').innerHTML = taxes.map(t => `
      <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
        <span class="font-bold text-slate-800">${t.name}</span>
        <span class="font-mono font-bold text-emerald-700">${(t.rate * 100).toFixed(0)}%</span>
      </div>
    `).join('');

    // Render Discounts
    document.getElementById('catalog-discounts-list').innerHTML = discounts.map(d => `
      <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
        <div>
          <span class="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">${d.code}</span>
          <span class="text-slate-500 ml-1.5">${d.type === 'percent' ? `${d.value}% Off` : `₹${d.value} Flat`} (Min: ₹${d.min_amount})</span>
        </div>
        <span class="text-slate-500">Used: <strong>${d.used_count}/${d.usage_limit}</strong></span>
      </div>
    `).join('');
  } catch (err) {
    console.error('Catalog load error:', err);
  }
}

// Admin Catalog Creation Modals
function openAddProductModal() { document.getElementById('product-modal').classList.remove('hidden'); }
function closeAddProductModal() { document.getElementById('product-modal').classList.add('hidden'); }

async function submitAddProduct(e) {
  e.preventDefault();
  const name = document.getElementById('new-prod-name').value;
  const sales_price = Number(document.getElementById('new-prod-price').value);
  const cost_price = Number(document.getElementById('new-prod-cost').value);
  const type = document.getElementById('new-prod-type').value;
  const notes = document.getElementById('new-prod-notes').value;
  const varValue = document.getElementById('new-prod-var-value').value;
  const varPrice = Number(document.getElementById('new-prod-var-price').value || 0);

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ name, sales_price, cost_price, type, notes })
    });
    const product = await res.json();
    if (!res.ok) throw new Error(product.error);

    if (varValue) {
      await fetch(`/api/products/${product.id}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
        body: JSON.stringify({ attribute: 'Brand', value: varValue, extra_price: varPrice })
      });
    }

    alert('Product created successfully!');
    closeAddProductModal();
    loadCatalog();
  } catch (err) {
    alert(err.message);
  }
}

function openAddPlanModal() { document.getElementById('plan-modal').classList.remove('hidden'); }
function closeAddPlanModal() { document.getElementById('plan-modal').classList.add('hidden'); }

async function submitAddPlan(e) {
  e.preventDefault();
  const name = document.getElementById('new-plan-name').value;
  const price = Number(document.getElementById('new-plan-price').value);
  const period = document.getElementById('new-plan-period').value;
  const auto_close = document.getElementById('new-plan-auto-close').checked ? 1 : 0;
  const closable = document.getElementById('new-plan-closable').checked ? 1 : 0;
  const pausable = document.getElementById('new-plan-pausable').checked ? 1 : 0;
  const renewable = document.getElementById('new-plan-renewable').checked ? 1 : 0;

  try {
    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ name, price, period, auto_close, closable, pausable, renewable })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    alert('Recurring plan created successfully!');
    closeAddPlanModal();
    loadCatalog();
  } catch (err) {
    alert(err.message);
  }
}

function openAddDiscountModal() { document.getElementById('discount-modal').classList.remove('hidden'); }
function closeAddDiscountModal() { document.getElementById('discount-modal').classList.add('hidden'); }

async function submitAddDiscount(e) {
  e.preventDefault();
  const code = document.getElementById('new-disc-code').value;
  const type = document.getElementById('new-disc-type').value;
  const value = Number(document.getElementById('new-disc-value').value);
  const min_amount = Number(document.getElementById('new-disc-min').value);
  const usage_limit = Number(document.getElementById('new-disc-limit').value);

  try {
    const res = await fetch('/api/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ code, type, value, min_amount, usage_limit, scope: 'subscription' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    alert('Discount rule created successfully!');
    closeAddDiscountModal();
    loadCatalog();
  } catch (err) {
    alert(err.message);
  }
}

function openAddTaxModal() { document.getElementById('tax-modal').classList.remove('hidden'); }
function closeAddTaxModal() { document.getElementById('tax-modal').classList.add('hidden'); }

async function submitAddTax(e) {
  e.preventDefault();
  const name = document.getElementById('new-tax-name').value;
  const rate = Number(document.getElementById('new-tax-rate').value);

  try {
    const res = await fetch('/api/taxes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ name, rate })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    alert('Tax rule created successfully!');
    closeAddTaxModal();
    loadCatalog();
  } catch (err) {
    alert(err.message);
  }
}

// ======================== STAFF MANAGEMENT (ADMIN ONLY) ========================
async function loadStaff() {
  try {
    const res = await fetch('/api/staff', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const staff = await res.json();
    const tableBody = document.getElementById('table-staff-body');

    if (!staff || staff.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">No staff members found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = staff.map(s => `
      <tr class="hover:bg-slate-50">
        <td class="p-3 font-bold text-slate-900">${s.name}</td>
        <td class="p-3 font-mono text-xs text-indigo-700">${s.email}</td>
        <td class="p-3"><span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800">${s.role}</span></td>
        <td class="p-3 text-xs text-slate-500">${s.created_at || 'Seeded'}</td>
        <td class="p-3 text-right text-xs text-slate-600 font-medium">Day-to-day operations</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Staff load error:', err);
  }
}

function openAddStaffModal() { document.getElementById('staff-modal').classList.remove('hidden'); }
function closeAddStaffModal() { document.getElementById('staff-modal').classList.add('hidden'); }

async function submitAddStaff(e) {
  e.preventDefault();
  const name = document.getElementById('new-staff-name').value;
  const email = document.getElementById('new-staff-email').value;
  const password = document.getElementById('new-staff-password').value;

  try {
    const res = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    alert(`✅ Staff account created for ${data.name} (${data.email})!`);
    closeAddStaffModal();
    loadStaff();
  } catch (err) {
    alert('Error creating staff: ' + err.message);
  }
}

// ======================== AUTH MODALS (SIGNUP & FORGOT PASSWORD) ========================
function showAuthModal() {
  document.getElementById('auth-modal').classList.remove('hidden');
}
function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
}
function switchAuthTab(type) {
  if (type === 'signup') {
    document.getElementById('form-signup').classList.remove('hidden');
    document.getElementById('form-forgot').classList.add('hidden');
    document.getElementById('auth-tab-signup').className = 'py-2 px-4 border-b-2 border-indigo-600 text-indigo-600 font-semibold';
    document.getElementById('auth-tab-forgot').className = 'py-2 px-4 text-slate-500 hover:text-slate-700 font-semibold';
  } else {
    document.getElementById('form-signup').classList.add('hidden');
    document.getElementById('form-forgot').classList.remove('hidden');
    document.getElementById('auth-tab-signup').className = 'py-2 px-4 text-slate-500 hover:text-slate-700 font-semibold';
    document.getElementById('auth-tab-forgot').className = 'py-2 px-4 border-b-2 border-indigo-600 text-indigo-600 font-semibold';
  }
}

async function submitRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    alert(`🎉 Account registered for ${data.name}!\nLogging in now...`);
    closeAuthModal();
    currentUser = data;
    currentToken = data.token;
    applyRolePermissions(data.role);
    document.getElementById('current-user-name').innerText = data.name;
    document.getElementById('current-user-role').innerText = data.role;
    document.getElementById('current-user-email').innerText = data.email;
    refreshCurrentView();
  } catch (err) {
    alert('Registration error: ' + err.message);
  }
}

async function submitForgot(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value;
  const resultDiv = document.getElementById('forgot-result');
  resultDiv.classList.remove('hidden');
  resultDiv.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Generating secure token...';

  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    resultDiv.innerHTML = `
      <strong class="text-emerald-700">✅ Reset Link Sent to ${email}!</strong><br>
      <span class="text-slate-600">Simulated Token: <code>${data.resetToken}</code></span><br>
      <span class="text-slate-400">Expires: ${data.expiresAt}</span>
    `;
  } catch (err) {
    resultDiv.innerHTML = `<span class="text-red-600">Error: ${err.message}</span>`;
  }
}

// ======================== DEMO SCRIPT HELPERS ========================
async function testWeakPassword() {
  const resultDiv = document.getElementById('demo-auth-result');
  resultDiv.classList.remove('hidden');
  resultDiv.className = 'mt-2 text-xs font-mono p-3 rounded bg-red-50 border border-red-200 text-red-700';
  resultDiv.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Submitting weak password ("123456")...';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_' + Date.now() + '@brightloop.test',
        password: '123'
      })
    });
    const data = await res.json();
    resultDiv.innerHTML = `<strong>❌ Rejected as Expected:</strong> ${data.error}`;
  } catch (err) {
    resultDiv.innerHTML = `<strong>❌ Rejected:</strong> ${err.message}`;
  }
}

async function testStrongPassword() {
  const resultDiv = document.getElementById('demo-auth-result');
  resultDiv.classList.remove('hidden');
  resultDiv.className = 'mt-2 text-xs font-mono p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-700';
  resultDiv.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Submitting valid password ("StrongPass@2026")...';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'client_' + Date.now() + '@brightloop.test',
        password: 'StrongPass@2026',
        name: 'Demo Enterprise User'
      })
    });
    const data = await res.json();
    resultDiv.innerHTML = `<strong>✅ Success! Account Created:</strong> ${data.email} with Role: <strong>${data.role}</strong>`;
  } catch (err) {
    resultDiv.innerHTML = `Error: ${err.message}`;
  }
}

async function testForgotPassword() {
  const resultDiv = document.getElementById('demo-auth-result');
  resultDiv.classList.remove('hidden');
  resultDiv.className = 'mt-2 text-xs font-mono p-3 rounded bg-indigo-50 border border-indigo-200 text-indigo-700';
  resultDiv.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Requesting reset token for dipak@brightloop.test...';

  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dipak@brightloop.test' })
    });
    const data = await res.json();
    resultDiv.innerHTML = `<strong>🔑 Reset Token Generated:</strong><br>${data.resetToken}<br><span class="text-slate-500">Expires: ${data.expiresAt}</span>`;
  } catch (err) {
    resultDiv.innerHTML = `Error: ${err.message}`;
  }
}

// Start application on load
window.addEventListener('DOMContentLoaded', initApp);