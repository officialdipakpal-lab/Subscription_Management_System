/**
 * Brightloop Subscription Management System
 * Core Application Engine & State Store
 */

(function () {
  'use strict';

  // --- Initial Default Seed Data ---
  const DEFAULT_DATA = {
    currentUser: {
      id: 'usr_admin',
      name: 'Dipak Pal',
      email: 'admin@brightloop.test',
      role: 'admin' // 'admin', 'staff', 'customer'
    },
    staffList: [
      { id: 'stf_1', name: 'Dipak Pal', email: 'admin@brightloop.test', role: 'admin', joined: '2026-01-10' },
      { id: 'stf_2', name: 'Shivam Yadav', email: 'shivambw3011@gmail.com', role: 'staff', joined: '2026-02-15' },
      { id: 'stf_3', name: 'Vijay Sharma', email: 'sharmavijay95111@gmail.com', role: 'staff', joined: '2026-03-01' }
    ],
    customers: [
      { id: 'cust_1', name: 'Alex Johnson', company: 'Acme Cloud Inc.', email: 'alex@acme.test', phone: '+1 (555) 234-5678', address: '100 Market St, San Francisco, CA', status: 'active', joined: '2026-01-15' },
      { id: 'cust_2', name: 'Sarah Miller', company: 'TechNova Labs', email: 'sarah@technova.test', phone: '+1 (555) 876-5432', address: '450 Silicon Ave, Austin, TX', status: 'active', joined: '2026-02-01' },
      { id: 'cust_3', name: 'David Lee', company: 'Nexus Health', email: 'david@nexushealth.test', phone: '+1 (555) 345-6789', address: '12 Medical Plaza, Boston, MA', status: 'active', joined: '2026-02-20' },
      { id: 'cust_4', name: 'Elena Rostova', company: 'Zenith Global Logistics', email: 'elena@zenithlog.test', phone: '+1 (555) 901-2345', address: '88 Harbour Way, Seattle, WA', status: 'active', joined: '2026-03-05' },
      { id: 'cust_5', name: 'Rajesh Kumar', company: 'Apex Fintech', email: 'customer@brightloop.test', phone: '+1 (555) 678-9012', address: '300 Financial Blvd, New York, NY', status: 'active', joined: '2026-03-12' }
    ],
    products: [
      { id: 'prod_1', name: 'Brightloop ERP Core', type: 'software', salesPrice: 1200, costPrice: 400, notes: 'Central enterprise ledger & resource management', variants: [{ name: 'Standard Edition', extraPrice: 0 }, { name: 'Odoo Enterprise Connector', extraPrice: 560 }] },
      { id: 'prod_2', name: 'Autonomous AI Agent Pack', type: 'service', salesPrice: 450, costPrice: 150, notes: 'Multi-agent developer & operations orchestrator', variants: [{ name: 'Single Agent', extraPrice: 0 }, { name: 'Cluster (5 Agents)', extraPrice: 600 }] },
      { id: 'prod_3', name: 'High-Concurrency Database Cache', type: 'service', salesPrice: 300, costPrice: 80, notes: 'In-memory Redis enterprise cluster with BullMQ', variants: [{ name: '10GB RAM', extraPrice: 0 }, { name: '50GB RAM', extraPrice: 400 }] },
      { id: 'prod_4', name: 'Automated Tax & Invoicing Module', type: 'software', salesPrice: 250, costPrice: 50, notes: 'Global compliance, GST & VAT reconciliation', variants: [{ name: 'Single Country', extraPrice: 0 }, { name: 'Multi-Jurisdiction', extraPrice: 200 }] }
    ],
    plans: [
      { id: 'plan_1', name: 'Monthly Professional', interval: 'monthly', price: 950, minQty: 1, availableFrom: '2026-01-01', availableTo: '2027-12-31', autoCloseAtEnd: false, closableEarly: true, pausable: true, renewable: true },
      { id: 'plan_2', name: 'Annual Enterprise SLA', interval: 'yearly', price: 9600, minQty: 5, availableFrom: '2026-01-01', availableTo: '2028-12-31', autoCloseAtEnd: false, closableEarly: false, pausable: true, renewable: true },
      { id: 'plan_3', name: 'Weekly Growth Sprint', interval: 'weekly', price: 300, minQty: 1, availableFrom: '2026-01-01', availableTo: '2026-12-31', autoCloseAtEnd: true, closableEarly: true, pausable: false, renewable: true },
      { id: 'plan_4', name: 'Daily Sandbox Pass', interval: 'daily', price: 45, minQty: 1, availableFrom: '2026-01-01', availableTo: '2026-12-31', autoCloseAtEnd: true, closableEarly: true, pausable: false, renewable: false }
    ],
    taxes: [
      { id: 'tax_1', name: 'Standard GST (18%)', rate: 18, region: 'India / Regional', isDefault: true },
      { id: 'tax_2', name: 'VAT Standard (5%)', rate: 5, region: 'UAE / GCC', isDefault: false },
      { id: 'tax_3', name: 'State Sales Tax (8.25%)', rate: 8.25, region: 'US - California / Texas', isDefault: false },
      { id: 'tax_4', name: 'Zero Tax / Export (0%)', rate: 0, region: 'International', isDefault: false }
    ],
    discounts: [
      { id: 'disc_1', code: 'LAUNCH15', name: '15% Growth Discount', type: 'percentage', value: 15, minPurchase: 500, minQty: 1, usageLimit: 50, usageCount: 12, validUntil: '2026-12-31', scope: 'all' },
      { id: 'disc_2', code: 'ENTERPRISE500', name: '$500 Tier Credit', type: 'fixed', value: 500, minPurchase: 2000, minQty: 5, usageLimit: 10, usageCount: 4, validUntil: '2026-12-31', scope: 'all' },
      { id: 'disc_3', code: 'ODOOPARTNER', name: 'Odoo Hackathon Special 20%', type: 'percentage', value: 20, minPurchase: 1000, minQty: 1, usageLimit: 100, usageCount: 22, validUntil: '2026-11-30', scope: 'prod_1' }
    ],
    subscriptions: [
      {
        id: 'sub_101',
        number: 'SUB-2026-001',
        customerId: 'cust_1',
        planId: 'plan_1',
        status: 'active', // 'draft', 'quotation', 'confirmed', 'active', 'paused', 'closed'
        startDate: '2026-02-01',
        expiryDate: '2027-02-01',
        nextBillingDate: '2026-11-01',
        paymentTerms: 'Net 15',
        discountCode: 'LAUNCH15',
        lines: [
          { productId: 'prod_1', variant: 'Odoo Enterprise Connector', qty: 2, unitPrice: 1760, taxId: 'tax_1' },
          { productId: 'prod_3', variant: '10GB RAM', qty: 1, unitPrice: 300, taxId: 'tax_1' }
        ],
        subtotal: 3820,
        discountAmount: 573,
        taxAmount: 584.46,
        totalAmount: 3831.46
      },
      {
        id: 'sub_102',
        number: 'SUB-2026-002',
        customerId: 'cust_2',
        planId: 'plan_2',
        status: 'active',
        startDate: '2026-01-15',
        expiryDate: '2027-01-15',
        nextBillingDate: '2026-11-15',
        paymentTerms: 'Net 30',
        discountCode: 'ENTERPRISE500',
        lines: [
          { productId: 'prod_1', variant: 'Standard Edition', qty: 5, unitPrice: 1200, taxId: 'tax_1' },
          { productId: 'prod_2', variant: 'Cluster (5 Agents)', qty: 2, unitPrice: 1050, taxId: 'tax_1' }
        ],
        subtotal: 8100,
        discountAmount: 500,
        taxAmount: 1368,
        totalAmount: 8968
      },
      {
        id: 'sub_103',
        number: 'SUB-2026-003',
        customerId: 'cust_3',
        planId: 'plan_1',
        status: 'paused',
        startDate: '2026-03-01',
        expiryDate: '2027-03-01',
        nextBillingDate: '2026-11-01',
        paymentTerms: 'Due on Receipt',
        discountCode: null,
        lines: [
          { productId: 'prod_4', variant: 'Single Country', qty: 3, unitPrice: 250, taxId: 'tax_2' }
        ],
        subtotal: 750,
        discountAmount: 0,
        taxAmount: 37.5,
        totalAmount: 787.5
      },
      {
        id: 'sub_104',
        number: 'SUB-2026-004',
        customerId: 'cust_4',
        planId: 'plan_1',
        status: 'quotation',
        startDate: '2026-11-01',
        expiryDate: '2027-11-01',
        nextBillingDate: '2026-11-01',
        paymentTerms: 'Net 15',
        discountCode: 'LAUNCH15',
        lines: [
          { productId: 'prod_1', variant: 'Standard Edition', qty: 1, unitPrice: 1200, taxId: 'tax_1' },
          { productId: 'prod_2', variant: 'Single Agent', qty: 2, unitPrice: 450, taxId: 'tax_1' }
        ],
        subtotal: 2100,
        discountAmount: 315,
        taxAmount: 321.3,
        totalAmount: 2106.3
      },
      {
        id: 'sub_105',
        number: 'SUB-2026-005',
        customerId: 'cust_5',
        planId: 'plan_3',
        status: 'active',
        startDate: '2026-10-15',
        expiryDate: '2026-11-15',
        nextBillingDate: '2026-11-01',
        paymentTerms: 'Due on Receipt',
        discountCode: null,
        lines: [
          { productId: 'prod_2', variant: 'Single Agent', qty: 1, unitPrice: 450, taxId: 'tax_1' }
        ],
        subtotal: 450,
        discountAmount: 0,
        taxAmount: 81,
        totalAmount: 531
      }
    ],
    quotations: [
      {
        id: 'quote_1',
        number: 'QUO-2026-012',
        customerId: 'cust_4',
        templateName: 'Enterprise SaaS Starter',
        planId: 'plan_1',
        validUntil: '2026-11-15',
        status: 'sent', // 'draft', 'sent', 'converted', 'expired'
        lines: [
          { productId: 'prod_1', variant: 'Standard Edition', qty: 1, unitPrice: 1200 },
          { productId: 'prod_2', variant: 'Single Agent', qty: 2, unitPrice: 450 }
        ],
        totalAmount: 2106.3
      },
      {
        id: 'quote_2',
        number: 'QUO-2026-013',
        customerId: 'cust_3',
        templateName: 'Autonomous AI Scale',
        planId: 'plan_2',
        validUntil: '2026-11-20',
        status: 'draft',
        lines: [
          { productId: 'prod_2', variant: 'Cluster (5 Agents)', qty: 3, unitPrice: 1050 }
        ],
        totalAmount: 3150
      }
    ],
    invoices: [
      {
        id: 'inv_1',
        number: 'INV-2026-001',
        subscriptionId: 'sub_101',
        customerId: 'cust_1',
        billingPeriod: '2026-10-01 to 2026-10-31',
        issueDate: '2026-10-01',
        dueDate: '2026-10-16',
        status: 'paid', // 'draft', 'confirmed', 'paid', 'overdue'
        subtotal: 3820,
        discountAmount: 573,
        taxAmount: 584.46,
        totalAmount: 3831.46,
        paidAmount: 3831.46,
        lines: [
          { description: 'Brightloop ERP Core (Odoo Enterprise Connector)', qty: 2, unitPrice: 1760, amount: 3520 },
          { description: 'High-Concurrency Database Cache (10GB RAM)', qty: 1, unitPrice: 300, amount: 300 }
        ]
      },
      {
        id: 'inv_2',
        number: 'INV-2026-002',
        subscriptionId: 'sub_102',
        customerId: 'cust_2',
        billingPeriod: '2026-10-01 to 2026-10-31',
        issueDate: '2026-10-01',
        dueDate: '2026-10-31',
        status: 'paid',
        subtotal: 8100,
        discountAmount: 500,
        taxAmount: 1368,
        totalAmount: 8968,
        paidAmount: 8968,
        lines: [
          { description: 'Brightloop ERP Core (Standard Edition)', qty: 5, unitPrice: 1200, amount: 6000 },
          { description: 'Autonomous AI Agent Pack (Cluster 5 Agents)', qty: 2, unitPrice: 1050, amount: 2100 }
        ]
      },
      {
        id: 'inv_3',
        number: 'INV-2026-003',
        subscriptionId: 'sub_105',
        customerId: 'cust_5',
        billingPeriod: '2026-10-15 to 2026-10-31',
        issueDate: '2026-10-15',
        dueDate: '2026-10-15',
        status: 'overdue',
        subtotal: 450,
        discountAmount: 0,
        taxAmount: 81,
        totalAmount: 531,
        paidAmount: 0,
        lines: [
          { description: 'Autonomous AI Agent Pack (Single Agent)', qty: 1, unitPrice: 450, amount: 450 }
        ]
      },
      {
        id: 'inv_4',
        number: 'INV-2026-004',
        subscriptionId: 'sub_103',
        customerId: 'cust_3',
        billingPeriod: '2026-09-01 to 2026-09-30',
        issueDate: '2026-09-01',
        dueDate: '2026-09-15',
        status: 'confirmed',
        subtotal: 750,
        discountAmount: 0,
        taxAmount: 37.5,
        totalAmount: 787.5,
        paidAmount: 300,
        lines: [
          { description: 'Automated Tax & Invoicing Module', qty: 3, unitPrice: 250, amount: 750 }
        ]
      }
    ],
    payments: [
      { id: 'pay_1', invoiceId: 'inv_1', customerId: 'cust_1', amount: 3831.46, method: 'Stripe Credit Card', date: '2026-10-05', reference: 'ch_3N19082BKLQ198', notes: 'Automated card capture' },
      { id: 'pay_2', invoiceId: 'inv_2', customerId: 'cust_2', amount: 8968.00, method: 'Wire Transfer / ACH', date: '2026-10-12', reference: 'ACH-2026-78190', notes: 'Quarterly prepayment settlement' },
      { id: 'pay_3', invoiceId: 'inv_4', customerId: 'cust_3', amount: 300.00, method: 'UPI / Direct Bank', date: '2026-09-20', reference: 'UPI-98218902', notes: 'Partial advance payment received' }
    ],
    notifications: [
      { id: 'notif_1', title: 'Invoice INV-2026-003 is overdue', time: '10 minutes ago', type: 'warning' },
      { id: 'notif_2', title: 'Subscription SUB-2026-001 billing generated', time: '2 hours ago', type: 'info' },
      { id: 'notif_3', title: 'Partial payment recorded for INV-2026-004 ($300)', time: 'Yesterday', type: 'success' }
    ],
    activityLog: [
      { id: 'act_1', action: 'Invoice Generated', target: 'INV-2026-003', user: 'Billing Engine', time: '2026-10-15 09:00' },
      { id: 'act_2', action: 'Subscription Activated', target: 'SUB-2026-005', user: 'Dipak Pal (Admin)', time: '2026-10-15 08:30' },
      { id: 'act_3', action: 'Payment Captured', target: '$8,968.00 via ACH', user: 'Stripe Webhook', time: '2026-10-12 14:15' }
    ]
  };

  // --- Main Application Controller Class ---
  class BrightloopApp {
    constructor() {
      this.data = this.loadData();
      this.currentPage = 'dashboard';
      this.charts = {};
      this.searchQuery = '';
      this.filterStatus = 'all';
      this.init();
    }

    loadData() {
      const stored = localStorage.getItem('brightloop_data_v2');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse stored data:', e);
        }
      }
      this.saveData(DEFAULT_DATA);
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    saveData(newData) {
      if (newData) this.data = newData;
      localStorage.setItem('brightloop_data_v2', JSON.stringify(this.data));
      this.updateBadges();
    }

    resetDemoData() {
      if (confirm('Reset all demo data back to default state?')) {
        this.saveData(JSON.parse(JSON.stringify(DEFAULT_DATA)));
        this.showToast('Demo data restored successfully!', 'success');
        this.navigateTo(this.currentPage);
      }
    }

    init() {
      this.bindEvents();
      this.updateUserProfileDisplay();
      this.handleHashChange();
      this.updateBadges();
      lucide.createIcons();
    }

    bindEvents() {
      window.addEventListener('hashchange', () => this.handleHashChange());

      // Quick Role Switcher
      const roleSwitch = document.getElementById('role-quick-switch');
      if (roleSwitch) {
        roleSwitch.value = this.data.currentUser.role;
        roleSwitch.addEventListener('change', (e) => {
          this.switchRole(e.target.value);
        });
      }

      // Mobile Sidebar
      document.getElementById('open-sidebar-mobile')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open-mobile');
      });
      document.getElementById('close-sidebar-mobile')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open-mobile');
      });

      // Command Palette (Ctrl+K)
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          this.toggleCommandPalette(true);
        }
        if (e.key === 'Escape') {
          this.toggleCommandPalette(false);
          this.closeModal();
          this.closeInvoiceModal();
        }
      });

      document.getElementById('btn-open-search')?.addEventListener('click', () => {
        this.toggleCommandPalette(true);
      });

      const paletteInput = document.getElementById('palette-search');
      paletteInput?.addEventListener('input', (e) => {
        this.filterCommandPalette(e.target.value);
      });

      document.getElementById('command-palette')?.addEventListener('click', (e) => {
        if (e.target.id === 'command-palette') this.toggleCommandPalette(false);
      });

      // Notifications Dropdown Toggle
      document.getElementById('btn-notifications')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('notif-dropdown')?.classList.toggle('hidden');
        document.getElementById('user-dropdown')?.classList.add('hidden');
      });

      // User Profile Dropdown Toggle
      document.getElementById('btn-user-profile')?.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('user-dropdown')?.classList.toggle('hidden');
        document.getElementById('notif-dropdown')?.classList.add('hidden');
      });

      document.addEventListener('click', () => {
        document.getElementById('notif-dropdown')?.classList.add('hidden');
        document.getElementById('user-dropdown')?.classList.add('hidden');
      });

      // Global Buttons
      document.getElementById('btn-global-new-sub')?.addEventListener('click', () => {
        this.openNewSubscriptionModal();
      });

      document.getElementById('btn-run-billing')?.addEventListener('click', () => {
        this.runAutomatedBillingEngine();
      });

      document.getElementById('modal-close-btn')?.addEventListener('click', () => {
        this.closeModal();
      });

      document.getElementById('invoice-modal-close')?.addEventListener('click', () => {
        this.closeInvoiceModal();
      });
    }

    switchRole(role) {
      if (role === 'admin') {
        this.data.currentUser = { id: 'usr_admin', name: 'Dipak Pal', email: 'admin@brightloop.test', role: 'admin' };
      } else if (role === 'staff') {
        this.data.currentUser = { id: 'usr_staff', name: 'Shivam Yadav', email: 'shivambw3011@gmail.com', role: 'staff' };
      } else {
        this.data.currentUser = { id: 'cust_5', name: 'Rajesh Kumar (Apex Fintech)', email: 'customer@brightloop.test', role: 'customer' };
      }
      this.saveData();
      this.updateUserProfileDisplay();
      this.showToast(`Switched view to: ${role.toUpperCase()}`, 'info');
      this.navigateTo(this.currentPage);
    }

    updateUserProfileDisplay() {
      const u = this.data.currentUser;
      const initials = u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      document.getElementById('user-avatar-initials').textContent = initials;
      document.getElementById('user-display-name').textContent = u.name;
      document.getElementById('user-display-role').textContent = `${u.role.toUpperCase()} • ${u.email}`;
      document.getElementById('dropdown-name').textContent = u.name;
      document.getElementById('dropdown-email').textContent = u.email;
      
      const badge = document.getElementById('current-role-badge');
      if (badge) {
        badge.textContent = u.role.toUpperCase();
        if (u.role === 'admin') {
          badge.className = 'px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200';
        } else if (u.role === 'staff') {
          badge.className = 'px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
        } else {
          badge.className = 'px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200';
        }
      }
    }

    updateBadges() {
      const activeSubs = this.data.subscriptions.filter(s => s.status === 'active').length;
      document.getElementById('badge-subs-count').textContent = activeSubs;

      const overdueInvs = this.data.invoices.filter(i => i.status === 'overdue').length;
      const overdueBadge = document.getElementById('badge-overdue-count');
      if (overdueBadge) {
        if (overdueInvs > 0) {
          overdueBadge.textContent = `${overdueInvs} due`;
          overdueBadge.classList.remove('hidden');
        } else {
          overdueBadge.classList.add('hidden');
        }
      }

      // Populate notifications list
      const notifList = document.getElementById('notif-list');
      if (notifList) {
        notifList.innerHTML = this.data.notifications.map(n => `
          <div class="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
            <span class="w-2 h-2 mt-1.5 rounded-full ${n.type === 'warning' ? 'bg-amber-500' : n.type === 'success' ? 'bg-emerald-500' : 'bg-brand-500'}"></span>
            <div>
              <p class="font-medium text-slate-800 leading-tight">${n.title}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">${n.time}</p>
            </div>
          </div>
        `).join('');
      }
    }

    clearNotifications() {
      this.data.notifications = [];
      this.saveData();
      this.updateBadges();
      this.showToast('All notifications cleared', 'info');
    }

    handleHashChange() {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.navigateTo(hash);
    }

    navigateTo(pageName) {
      this.currentPage = pageName;
      document.getElementById('page-breadcrumb').textContent = pageName.replace('-', ' ');

      // Update active nav styling
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
        if (el.getAttribute('data-page') === pageName) {
          el.classList.add('active');
        }
      });

      // Render corresponding page
      const content = document.getElementById('app-content');
      switch (pageName) {
        case 'dashboard':
          content.innerHTML = this.renderDashboard();
          this.initDashboardCharts();
          break;
        case 'subscriptions':
          content.innerHTML = this.renderSubscriptions();
          break;
        case 'customers':
          content.innerHTML = this.renderCustomers();
          break;
        case 'products':
          content.innerHTML = this.renderProductsAndPlans();
          break;
        case 'quotations':
          content.innerHTML = this.renderQuotations();
          break;
        case 'invoices':
          content.innerHTML = this.renderInvoices();
          break;
        case 'payments':
          content.innerHTML = this.renderPayments();
          break;
        case 'discounts':
          content.innerHTML = this.renderDiscounts();
          break;
        case 'taxes':
          content.innerHTML = this.renderTaxes();
          break;
        case 'reports':
          content.innerHTML = this.renderReports();
          this.initReportsCharts();
          break;
        case 'settings':
          content.innerHTML = this.renderSettings();
          break;
        default:
          content.innerHTML = this.renderDashboard();
          this.initDashboardCharts();
      }

      lucide.createIcons();
      window.scrollTo(0, 0);
    }

    // --- Helper Calculations ---
    calculateMetrics() {
      const activeSubs = this.data.subscriptions.filter(s => s.status === 'active');
      const mrr = activeSubs.reduce((acc, s) => {
        const plan = this.data.plans.find(p => p.id === s.planId);
        if (plan?.interval === 'monthly') return acc + s.totalAmount;
        if (plan?.interval === 'yearly') return acc + (s.totalAmount / 12);
        if (plan?.interval === 'weekly') return acc + (s.totalAmount * 4.33);
        if (plan?.interval === 'daily') return acc + (s.totalAmount * 30);
        return acc + s.totalAmount;
      }, 0);

      const arr = mrr * 12;
      const totalCollected = this.data.payments.reduce((acc, p) => acc + p.amount, 0);
      const pendingInvoices = this.data.invoices.filter(i => i.status !== 'paid');
      const pendingAmount = pendingInvoices.reduce((acc, i) => acc + (i.totalAmount - (i.paidAmount || 0)), 0);
      const overdueInvoices = this.data.invoices.filter(i => i.status === 'overdue');
      const overdueAmount = overdueInvoices.reduce((acc, i) => acc + (i.totalAmount - (i.paidAmount || 0)), 0);

      return {
        mrr: Math.round(mrr),
        arr: Math.round(arr),
        activeSubsCount: activeSubs.length,
        totalCustomers: this.data.customers.length,
        totalCollected: Math.round(totalCollected),
        pendingAmount: Math.round(pendingAmount),
        overdueCount: overdueInvoices.length,
        overdueAmount: Math.round(overdueAmount)
      };
    }

    // ==========================================
    // 1. DASHBOARD VIEW
    // ==========================================
    renderDashboard() {
      const metrics = this.calculateMetrics();
      const recentSubs = this.data.subscriptions.slice(-4).reverse();
      const recentInvs = this.data.invoices.slice(-4).reverse();

      return `
        <div class="space-y-8 animate-scale-up">
          <!-- Page Header & Quick Notice -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
              <p class="text-xs text-slate-500 mt-1">Real-time revenue metrics, active subscriptions and billing reconciliation.</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Next Automated Billing: Nov 1, 2026
              </span>
            </div>
          </div>

          <!-- Top Metric Cards (Stripe / Linear style) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Card 1: MRR -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
              <div class="flex items-center justify-between text-slate-500 mb-2">
                <span class="text-xs font-semibold tracking-wide uppercase">Monthly Recurring (MRR)</span>
                <div class="p-2 rounded-xl bg-brand-50 text-brand-600">
                  <i data-lucide="trending-up" class="w-4 h-4"></i>
                </div>
              </div>
              <div class="flex items-baseline gap-2">
                <h3 class="text-2xl font-bold text-slate-900">$${metrics.mrr.toLocaleString()}</h3>
                <span class="text-xs font-semibold text-emerald-600 flex items-center">
                  <i data-lucide="arrow-up-right" class="w-3 h-3"></i> +14.2%
                </span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Projected ARR: <strong>$${metrics.arr.toLocaleString()}</strong></p>
            </div>

            <!-- Card 2: Active Subscriptions -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
              <div class="flex items-center justify-between text-slate-500 mb-2">
                <span class="text-xs font-semibold tracking-wide uppercase">Active Subscriptions</span>
                <div class="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <i data-lucide="repeat" class="w-4 h-4"></i>
                </div>
              </div>
              <div class="flex items-baseline gap-2">
                <h3 class="text-2xl font-bold text-slate-900">${metrics.activeSubsCount}</h3>
                <span class="text-xs font-semibold text-emerald-600 flex items-center">
                  <i data-lucide="arrow-up-right" class="w-3 h-3"></i> +3 this month
                </span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Across <strong>${metrics.totalCustomers}</strong> paying customers</p>
            </div>

            <!-- Card 3: Revenue Collected -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
              <div class="flex items-center justify-between text-slate-500 mb-2">
                <span class="text-xs font-semibold tracking-wide uppercase">Collected Revenue</span>
                <div class="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                </div>
              </div>
              <div class="flex items-baseline gap-2">
                <h3 class="text-2xl font-bold text-slate-900">$${metrics.totalCollected.toLocaleString()}</h3>
                <span class="text-xs font-semibold text-slate-500">Total Settled</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Pending Invoices: <strong>$${metrics.pendingAmount.toLocaleString()}</strong></p>
            </div>

            <!-- Card 4: Overdue Invoices -->
            <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all">
              <div class="flex items-center justify-between text-slate-500 mb-2">
                <span class="text-xs font-semibold tracking-wide uppercase">Overdue Amount</span>
                <div class="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <i data-lucide="alert-circle" class="w-4 h-4"></i>
                </div>
              </div>
              <div class="flex items-baseline gap-2">
                <h3 class="text-2xl font-bold text-rose-600">$${metrics.overdueAmount.toLocaleString()}</h3>
                <span class="text-xs font-bold text-rose-600 px-1.5 py-0.5 rounded bg-rose-50">${metrics.overdueCount} Invoices</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Requires follow-up / dunning</p>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Revenue Growth Trend Chart -->
            <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">Revenue & MRR Progression</h4>
                  <p class="text-xs text-slate-400">Monthly recurring income trajectory over last 6 months</p>
                </div>
                <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">2026 FY</span>
              </div>
              <div class="h-64">
                <canvas id="chart-revenue-trend"></canvas>
              </div>
            </div>

            <!-- Plan Distribution Chart -->
            <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
              <div>
                <h4 class="font-bold text-slate-900 text-sm mb-1">Subscriptions by Plan</h4>
                <p class="text-xs text-slate-400 mb-4">Breakdown by active billing cadence</p>
                <div class="h-48 relative flex items-center justify-center">
                  <canvas id="chart-plan-distribution"></canvas>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-brand-500"></span> Pro Monthly</div>
                <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> Annual SLA</div>
                <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-accent-500"></span> Growth Sprint</div>
                <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Daily Pass</div>
              </div>
            </div>
          </div>

          <!-- Recent Activity & Quick Action Pipelines -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Recent Subscriptions -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
              <div class="p-5 border-b border-slate-100 flex items-center justify-between">
                <h4 class="font-bold text-slate-900 text-sm">Recent Subscriptions</h4>
                <a href="#subscriptions" class="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  View all <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </a>
              </div>
              <div class="divide-y divide-slate-100">
                ${recentSubs.map(s => {
                  const cust = this.data.customers.find(c => c.id === s.customerId);
                  return `
                    <div class="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-all">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs">
                          ${cust?.name?.substring(0, 2).toUpperCase() || 'SU'}
                        </div>
                        <div>
                          <p class="text-xs font-bold text-slate-900">${cust?.company || cust?.name}</p>
                          <p class="text-[11px] text-slate-400">${s.number} • Next: ${s.nextBillingDate}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-xs font-bold text-slate-900">$${s.totalAmount.toLocaleString()}</p>
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full badge-${s.status} capitalize">${s.status}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Recent Invoices & Billing Engine Status -->
            <div class="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
              <div class="p-5 border-b border-slate-100 flex items-center justify-between">
                <h4 class="font-bold text-slate-900 text-sm">Recent Invoices</h4>
                <a href="#invoices" class="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  View all <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </a>
              </div>
              <div class="divide-y divide-slate-100">
                ${recentInvs.map(inv => {
                  const cust = this.data.customers.find(c => c.id === inv.customerId);
                  return `
                    <div class="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-all">
                      <div class="flex items-center gap-3">
                        <div class="p-2 rounded-lg bg-slate-100 text-slate-600">
                          <i data-lucide="receipt" class="w-4 h-4"></i>
                        </div>
                        <div>
                          <p class="text-xs font-bold text-slate-900">${inv.number} • ${cust?.company || 'Direct'}</p>
                          <p class="text-[11px] text-slate-400">Due: ${inv.dueDate}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-xs font-bold text-slate-900">$${inv.totalAmount.toLocaleString()}</p>
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full badge-${inv.status} capitalize">${inv.status}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    initDashboardCharts() {
      // Destroy previous chart instances to prevent canvas reuse errors
      if (this.charts.revenue) this.charts.revenue.destroy();
      if (this.charts.plan) this.charts.plan.destroy();

      // Revenue Trend Chart
      const ctxRev = document.getElementById('chart-revenue-trend')?.getContext('2d');
      if (ctxRev) {
        this.charts.revenue = new Chart(ctxRev, {
          type: 'line',
          data: {
            labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct (Now)'],
            datasets: [
              {
                label: 'MRR ($)',
                data: [32000, 36500, 39200, 42800, 45100, 48250],
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                fill: true,
                tension: 0.35,
                borderWidth: 2.5,
                pointBackgroundColor: '#4f46e5',
                pointRadius: 4
              },
              {
                label: 'Collected Cash ($)',
                data: [28000, 34000, 38000, 41000, 43500, 38420],
                borderColor: '#10b981',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.35,
                borderWidth: 2,
                pointRadius: 3
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, family: 'Plus Jakarta Sans' } } }
            },
            scales: {
              y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
              x: { grid: { display: false }, ticks: { font: { size: 10 } } }
            }
          }
        });
      }

      // Plan Distribution Chart
      const ctxPlan = document.getElementById('chart-plan-distribution')?.getContext('2d');
      if (ctxPlan) {
        this.charts.plan = new Chart(ctxPlan, {
          type: 'doughnut',
          data: {
            labels: ['Pro Monthly', 'Annual SLA', 'Growth Sprint', 'Daily Pass'],
            datasets: [{
              data: [45, 30, 15, 10],
              backgroundColor: ['#6366f1', '#818cf8', '#a855f7', '#cbd5e1'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            cutout: '72%'
          }
        });
      }
    }

    // ==========================================
    // 2. SUBSCRIPTION MANAGEMENT VIEW
    // ==========================================
    renderSubscriptions() {
      let subs = this.data.subscriptions;
      
      // If Customer Portal view, restrict to their subscriptions
      if (this.data.currentUser.role === 'customer') {
        subs = subs.filter(s => s.customerId === this.data.currentUser.id);
      }

      // Filter by status tab
      if (this.filterStatus && this.filterStatus !== 'all') {
        subs = subs.filter(s => s.status === this.filterStatus);
      }

      // Filter by search query
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        subs = subs.filter(s => {
          const cust = this.data.customers.find(c => c.id === s.customerId);
          return s.number.toLowerCase().includes(q) || cust?.company?.toLowerCase().includes(q) || cust?.name?.toLowerCase().includes(q);
        });
      }

      const statuses = ['all', 'draft', 'quotation', 'confirmed', 'active', 'paused', 'closed'];

      return `
        <div class="space-y-6 animate-scale-up">
          <!-- Header & Actions -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Subscriptions</h1>
              <p class="text-xs text-slate-500 mt-1">Lifecycle pipeline: Draft → Quotation → Confirmed → Active → Closed.</p>
            </div>
            ${this.data.currentUser.role !== 'customer' ? `
              <button onclick="app.openNewSubscriptionModal()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card transition-all">
                <i data-lucide="plus" class="w-4 h-4"></i> Create Subscription
              </button>
            ` : ''}
          </div>

          <!-- Controls: Status Tabs & Search -->
          <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div class="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
              ${statuses.map(st => `
                <button onclick="app.setSubFilter('${st}')" class="px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all whitespace-nowrap ${this.filterStatus === st ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}">
                  ${st}
                </button>
              `).join('')}
            </div>
            <div class="relative w-full md:w-64">
              <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
              <input type="text" placeholder="Search subscriptions..." value="${this.searchQuery}" oninput="app.setSubSearch(this.value)" class="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500">
            </div>
          </div>

          <!-- Subscriptions Table -->
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="border-b border-slate-100 bg-slate-50/70 text-slate-400 uppercase tracking-wider font-semibold">
                    <th class="py-3.5 px-4">Subscription #</th>
                    <th class="py-3.5 px-4">Customer</th>
                    <th class="py-3.5 px-4">Plan & Cadence</th>
                    <th class="py-3.5 px-4">Next Billing</th>
                    <th class="py-3.5 px-4">Total Amount</th>
                    <th class="py-3.5 px-4">Status</th>
                    <th class="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${subs.length === 0 ? `
                    <tr>
                      <td colspan="7" class="py-12 text-center text-slate-400">
                        <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 opacity-40"></i>
                        <p class="font-medium text-xs">No subscriptions found matching filters</p>
                      </td>
                    </tr>
                  ` : subs.map(sub => {
                    const cust = this.data.customers.find(c => c.id === sub.customerId);
                    const plan = this.data.plans.find(p => p.id === sub.planId);
                    return `
                      <tr class="table-hover-row">
                        <td class="py-3.5 px-4 font-bold text-slate-900">${sub.number}</td>
                        <td class="py-3.5 px-4">
                          <p class="font-semibold text-slate-800">${cust?.company || cust?.name || 'Unknown'}</p>
                          <p class="text-[10px] text-slate-400">${cust?.email || ''}</p>
                        </td>
                        <td class="py-3.5 px-4">
                          <p class="font-medium text-slate-700">${plan?.name || 'Custom Plan'}</p>
                          <span class="text-[10px] uppercase font-semibold text-slate-400">${plan?.interval || 'monthly'}</span>
                        </td>
                        <td class="py-3.5 px-4 font-mono text-slate-600">${sub.nextBillingDate}</td>
                        <td class="py-3.5 px-4 font-bold text-slate-900">$${sub.totalAmount.toLocaleString()}</td>
                        <td class="py-3.5 px-4">
                          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize badge-${sub.status}">
                            ${sub.status}
                          </span>
                        </td>
                        <td class="py-3.5 px-4 text-right">
                          <div class="inline-flex items-center gap-1.5">
                            <button onclick="app.viewSubscriptionDetails('${sub.id}')" title="View Details" class="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-all">
                              <i data-lucide="eye" class="w-4 h-4"></i>
                            </button>
                            ${this.data.currentUser.role !== 'customer' ? `
                              <button onclick="app.openSubActionMenu('${sub.id}')" title="Manage Status" class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all">
                                <i data-lucide="more-horizontal" class="w-4 h-4"></i>
                              </button>
                            ` : ''}
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    setSubFilter(status) {
      this.filterStatus = status;
      this.navigateTo('subscriptions');
    }

    setSubSearch(query) {
      this.searchQuery = query;
      this.navigateTo('subscriptions');
    }

    viewSubscriptionDetails(subId) {
      const sub = this.data.subscriptions.find(s => s.id === subId);
      if (!sub) return;
      const cust = this.data.customers.find(c => c.id === sub.customerId);
      const plan = this.data.plans.find(p => p.id === sub.planId);

      this.openModal(
        `Subscription Details: ${sub.number}`,
        `Client: ${cust?.company || cust?.name} • Status: ${sub.status.toUpperCase()}`,
        `
          <div class="space-y-5 text-xs">
            <!-- Summary Info Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <p class="text-slate-400 font-semibold uppercase text-[10px]">Plan</p>
                <p class="font-bold text-slate-800 mt-0.5">${plan?.name}</p>
              </div>
              <div>
                <p class="text-slate-400 font-semibold uppercase text-[10px]">Billing Cadence</p>
                <p class="font-bold text-slate-800 mt-0.5 capitalize">${plan?.interval}</p>
              </div>
              <div>
                <p class="text-slate-400 font-semibold uppercase text-[10px]">Start Date</p>
                <p class="font-bold text-slate-800 mt-0.5">${sub.startDate}</p>
              </div>
              <div>
                <p class="text-slate-400 font-semibold uppercase text-[10px]">Expiry Date</p>
                <p class="font-bold text-slate-800 mt-0.5">${sub.expiryDate}</p>
              </div>
            </div>

            <!-- Line Items Table -->
            <div>
              <h4 class="font-bold text-slate-800 mb-2">Subscribed Product Line Items</h4>
              <div class="border border-slate-200/80 rounded-xl overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-400 border-b border-slate-100 uppercase text-[10px]">
                    <tr>
                      <th class="p-2.5">Product & Variant</th>
                      <th class="p-2.5 text-center">Qty</th>
                      <th class="p-2.5 text-right">Unit Price</th>
                      <th class="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    ${sub.lines.map(line => {
                      const prod = this.data.products.find(p => p.id === line.productId);
                      return `
                        <tr>
                          <td class="p-2.5">
                            <span class="font-bold text-slate-800">${prod?.name || 'Item'}</span>
                            <span class="text-slate-400 block text-[10px]">${line.variant || 'Standard'}</span>
                          </td>
                          <td class="p-2.5 text-center font-bold">${line.qty}</td>
                          <td class="p-2.5 text-right font-mono">$${line.unitPrice}</td>
                          <td class="p-2.5 text-right font-bold text-slate-900 font-mono">$${line.qty * line.unitPrice}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Financials Breakdown -->
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-1 text-slate-600 text-xs">
              <div class="flex justify-between">
                <span>Subtotal:</span>
                <span class="font-mono font-bold">$${sub.subtotal.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-emerald-600">
                <span>Discount (${sub.discountCode || 'None'}):</span>
                <span class="font-mono font-bold">-$${sub.discountAmount.toFixed(2)}</span>
              </div>
              <div class="flex justify-between">
                <span>Tax Rules Applied:</span>
                <span class="font-mono font-bold">+$${sub.taxAmount.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-200">
                <span>Grand Total (per period):</span>
                <span class="font-mono text-brand-600">$${sub.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        `,
        `
          <button onclick="app.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Close</button>
          ${this.data.currentUser.role !== 'customer' ? `
            <button onclick="app.generateInvoiceFromSub('${sub.id}')" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card">
              Generate Invoice Now
            </button>
          ` : ''}
        `
      );
    }

    openSubActionMenu(subId) {
      const sub = this.data.subscriptions.find(s => s.id === subId);
      if (!sub) return;

      this.openModal(
        `Manage Status: ${sub.number}`,
        `Current Status: ${sub.status.toUpperCase()}`,
        `
          <div class="space-y-3 text-xs">
            <p class="text-slate-500">Perform state machine transition for this recurring contract:</p>
            <div class="grid grid-cols-2 gap-2">
              ${sub.status === 'draft' || sub.status === 'quotation' ? `
                <button onclick="app.transitionSubStatus('${sub.id}', 'confirmed')" class="p-3 text-left rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all">
                  <span class="font-bold text-slate-800 block">Confirm Contract</span>
                  <span class="text-[10px] text-slate-400">Move to Confirmed stage</span>
                </button>
              ` : ''}

              ${sub.status === 'confirmed' || sub.status === 'paused' ? `
                <button onclick="app.transitionSubStatus('${sub.id}', 'active')" class="p-3 text-left rounded-xl border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all">
                  <span class="font-bold text-emerald-800 block">Activate Subscription</span>
                  <span class="text-[10px] text-slate-400">Enable recurring billing</span>
                </button>
              ` : ''}

              ${sub.status === 'active' ? `
                <button onclick="app.transitionSubStatus('${sub.id}', 'paused')" class="p-3 text-left rounded-xl border border-amber-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all">
                  <span class="font-bold text-amber-800 block">Pause Subscription</span>
                  <span class="text-[10px] text-slate-400">Suspend automated billing</span>
                </button>
              ` : ''}

              ${sub.status !== 'closed' ? `
                <button onclick="app.transitionSubStatus('${sub.id}', 'closed')" class="p-3 text-left rounded-xl border border-rose-200 hover:border-rose-500 hover:bg-rose-50/50 transition-all">
                  <span class="font-bold text-rose-800 block">Close Contract</span>
                  <span class="text-[10px] text-slate-400">Permanently terminate</span>
                </button>
              ` : ''}

              <button onclick="app.renewSubscription('${sub.id}')" class="p-3 text-left rounded-xl border border-brand-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all">
                <span class="font-bold text-brand-800 block">Renew (+1 Cycle)</span>
                <span class="text-[10px] text-slate-400">Extend expiry date</span>
              </button>
            </div>
          </div>
        `,
        `
          <button onclick="app.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
        `
      );
    }

    transitionSubStatus(subId, newStatus) {
      const sub = this.data.subscriptions.find(s => s.id === subId);
      if (sub) {
        sub.status = newStatus;
        this.saveData();
        this.showToast(`Subscription ${sub.number} moved to ${newStatus.toUpperCase()}`, 'success');
        this.closeModal();
        this.navigateTo('subscriptions');
      }
    }

    renewSubscription(subId) {
      const sub = this.data.subscriptions.find(s => s.id === subId);
      if (sub) {
        const parts = sub.expiryDate.split('-');
        const nextYear = parseInt(parts[0]) + 1;
        sub.expiryDate = `${nextYear}-${parts[1]}-${parts[2]}`;
        sub.status = 'active';
        this.saveData();
        this.showToast(`Subscription ${sub.number} renewed until ${sub.expiryDate}`, 'success');
        this.closeModal();
        this.navigateTo('subscriptions');
      }
    }

    openNewSubscriptionModal() {
      const customers = this.data.customers;
      const plans = this.data.plans;
      const products = this.data.products;
      const discounts = this.data.discounts;

      this.openModal(
        'Create New Subscription',
        'Configure customer, plan, product variants, and auto-tax rules',
        `
          <form id="form-new-sub" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Customer *</label>
                <select id="sub-customer-id" required class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
                  ${customers.map(c => `<option value="${c.id}">${c.company} (${c.name})</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Billing Plan *</label>
                <select id="sub-plan-id" required class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
                  ${plans.map(p => `<option value="${p.id}">${p.name} ($${p.price} / ${p.interval})</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Start Date</label>
                <input type="date" id="sub-start-date" value="2026-11-01" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                <input type="date" id="sub-expiry-date" value="2027-11-01" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                <select id="sub-terms" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
            </div>

            <div class="border-t border-slate-100 pt-3">
              <label class="block font-semibold text-slate-700 mb-1">Product Line Item</label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select id="sub-product-id" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
                  ${products.map(p => `<option value="${p.id}">${p.name} (Base: $${p.salesPrice})</option>`).join('')}
                </select>
                <select id="sub-product-variant" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <option value="Standard Edition">Standard Edition (+0)</option>
                  <option value="Odoo Enterprise Connector">Odoo Brand Connector (+560)</option>
                  <option value="Cluster (5 Agents)">Cluster Edition (+600)</option>
                </select>
                <input type="number" id="sub-product-qty" min="1" value="1" placeholder="Quantity" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Apply Discount Rule</label>
                <select id="sub-discount-code" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <option value="">No Discount</option>
                  ${discounts.map(d => `<option value="${d.code}">${d.code} — ${d.name}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Initial Status</label>
                <select id="sub-initial-status" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <option value="active">Active (Immediate Billing)</option>
                  <option value="draft">Draft</option>
                  <option value="quotation">Quotation</option>
                </select>
              </div>
            </div>
          </form>
        `,
        `
          <button onclick="app.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onclick="app.submitNewSubscription()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card">
            Confirm & Save Subscription
          </button>
        `
      );
    }

    submitNewSubscription() {
      const custId = document.getElementById('sub-customer-id').value;
      const planId = document.getElementById('sub-plan-id').value;
      const startDate = document.getElementById('sub-start-date').value;
      const expiryDate = document.getElementById('sub-expiry-date').value;
      const terms = document.getElementById('sub-terms').value;
      const prodId = document.getElementById('sub-product-id').value;
      const variant = document.getElementById('sub-product-variant').value;
      const qty = parseInt(document.getElementById('sub-product-qty').value) || 1;
      const discountCode = document.getElementById('sub-discount-code').value;
      const status = document.getElementById('sub-initial-status').value;

      const product = this.data.products.find(p => p.id === prodId);
      const plan = this.data.plans.find(p => p.id === planId);
      let unitPrice = product ? product.salesPrice : 1000;
      if (variant.includes('+560')) unitPrice += 560;
      if (variant.includes('+600')) unitPrice += 600;

      const subtotal = unitPrice * qty;
      let discountAmount = 0;
      if (discountCode) {
        const disc = this.data.discounts.find(d => d.code === discountCode);
        if (disc) {
          discountAmount = disc.type === 'percentage' ? (subtotal * disc.value / 100) : disc.value;
        }
      }

      const taxable = Math.max(0, subtotal - discountAmount);
      const taxAmount = taxable * 0.18; // Default GST 18%
      const totalAmount = taxable + taxAmount;

      const nextNum = `SUB-2026-${String(this.data.subscriptions.length + 1).padStart(3, '0')}`;
      const newSub = {
        id: `sub_${Date.now()}`,
        number: nextNum,
        customerId: custId,
        planId: planId,
        status: status,
        startDate: startDate,
        expiryDate: expiryDate,
        nextBillingDate: startDate,
        paymentTerms: terms,
        discountCode: discountCode || null,
        lines: [
          { productId: prodId, variant: variant, qty: qty, unitPrice: unitPrice, taxId: 'tax_1' }
        ],
        subtotal: subtotal,
        discountAmount: discountAmount,
        taxAmount: taxAmount,
        totalAmount: totalAmount
      };

      this.data.subscriptions.unshift(newSub);
      this.data.activityLog.unshift({
        id: `act_${Date.now()}`,
        action: 'Subscription Created',
        target: `${nextNum} (${status})`,
        user: this.data.currentUser.name,
        time: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });

      this.saveData();
      this.showToast(`New subscription ${nextNum} created!`, 'success');
      this.closeModal();
      this.navigateTo('subscriptions');
    }

    // ==========================================
    // 3. CUSTOMER MANAGEMENT VIEW
    // ==========================================
    renderCustomers() {
      const customers = this.data.customers;

      return `
        <div class="space-y-6 animate-scale-up">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Directory</h1>
              <p class="text-xs text-slate-500 mt-1">Manage accounts, view active contracts and billing ledger.</p>
            </div>
            ${this.data.currentUser.role !== 'customer' ? `
              <button onclick="app.openNewCustomerModal()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card transition-all">
                <i data-lucide="user-plus" class="w-4 h-4"></i> Add Customer
              </button>
            ` : ''}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${customers.map(c => {
              const clientSubs = this.data.subscriptions.filter(s => s.customerId === c.id);
              const totalSpent = this.data.payments.filter(p => p.customerId === c.id).reduce((acc, p) => acc + p.amount, 0);

              return `
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between">
                  <div>
                    <div class="flex items-start justify-between mb-3">
                      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-subtle">
                        ${c.company.substring(0, 2).toUpperCase()}
                      </div>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                        ${c.status}
                      </span>
                    </div>
                    <h3 class="text-sm font-bold text-slate-900">${c.company}</h3>
                    <p class="text-xs text-slate-500 font-medium">${c.name}</p>
                    <div class="mt-3 space-y-1 text-slate-400 text-xs">
                      <p class="flex items-center gap-2 text-slate-600"><i data-lucide="mail" class="w-3.5 h-3.5"></i> ${c.email}</p>
                      <p class="flex items-center gap-2 text-slate-600"><i data-lucide="phone" class="w-3.5 h-3.5"></i> ${c.phone}</p>
                      <p class="flex items-center gap-2 text-slate-400 text-[11px]"><i data-lucide="map-pin" class="w-3.5 h-3.5"></i> ${c.address}</p>
                    </div>
                  </div>

                  <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span class="text-slate-400 block text-[10px]">Active Contracts</span>
                      <span class="font-bold text-slate-800">${clientSubs.length} Subscriptions</span>
                    </div>
                    <div class="text-right">
                      <span class="text-slate-400 block text-[10px]">Total Revenue</span>
                      <span class="font-bold text-brand-600 font-mono">$${totalSpent.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    openNewCustomerModal() {
      this.openModal(
        'Add New Customer Account',
        'Enroll client company into the subscription ledger',
        `
          <form id="form-new-cust" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Company / Organization *</label>
              <input type="text" id="cust-company" required placeholder="e.g. Acme Tech Solutions" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Primary Contact Name *</label>
                <input type="text" id="cust-name" required placeholder="Full Name" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Official Email Address *</label>
                <input type="email" id="cust-email" required placeholder="contact@company.com" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input type="text" id="cust-phone" placeholder="+1 (555) 000-0000" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Billing City / State</label>
                <input type="text" id="cust-address" placeholder="San Francisco, CA" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
              </div>
            </div>
          </form>
        `,
        `
          <button onclick="app.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onclick="app.submitNewCustomer()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card">
            Enroll Customer
          </button>
        `
      );
    }

    submitNewCustomer() {
      const company = document.getElementById('cust-company').value;
      const name = document.getElementById('cust-name').value;
      const email = document.getElementById('cust-email').value;
      const phone = document.getElementById('cust-phone').value || '+1 (555) 000-0000';
      const address = document.getElementById('cust-address').value || 'Remote / Online';

      if (!company || !name || !email) {
        this.showToast('Please fill in required fields', 'error');
        return;
      }

      const newCust = {
        id: `cust_${Date.now()}`,
        name: name,
        company: company,
        email: email,
        phone: phone,
        address: address,
        status: 'active',
        joined: new Date().toISOString().substring(0, 10)
      };

      this.data.customers.unshift(newCust);
      this.saveData();
      this.showToast(`Customer account for ${company} registered!`, 'success');
      this.closeModal();
      this.navigateTo('customers');
    }

    // ==========================================
    // 4. PRODUCTS & PLANS VIEW (With Odoo Variants)
    // ==========================================
    renderProductsAndPlans() {
      const products = this.data.products;
      const plans = this.data.plans;

      return `
        <div class="space-y-8 animate-scale-up">
          <!-- Products Section -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-xl font-bold text-slate-900 tracking-tight">Products & Variants Catalog</h2>
                <p class="text-xs text-slate-500 mt-0.5">Software core, add-on modules, and brand variant pricing (e.g. Odoo connector +$560)</p>
              </div>
              ${this.data.currentUser.role === 'admin' ? `
                <button onclick="app.openNewProductModal()" class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition-all">
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Product
                </button>
              ` : ''}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${products.map(p => `
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-bold text-slate-900">${p.name}</span>
                      <span class="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">${p.type}</span>
                    </div>
                    <p class="text-xs text-slate-500 mb-3">${p.notes}</p>
                    <div class="flex items-center gap-4 text-xs font-mono mb-4">
                      <span class="text-slate-900 font-bold">Sales: $${p.salesPrice}</span>
                      <span class="text-slate-400">Cost: $${p.costPrice}</span>
                      <span class="text-emerald-600 font-bold">Margin: $${p.salesPrice - p.costPrice}</span>
                    </div>
                  </div>

                  <!-- Variants List -->
                  <div class="border-t border-slate-100 pt-3">
                    <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Supported Variants & Extra Price</p>
                    <div class="space-y-1">
                      ${p.variants.map(v => `
                        <div class="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50 border border-slate-100 font-medium">
                          <span class="text-slate-700 flex items-center gap-1.5">
                            <i data-lucide="layers" class="w-3 h-3 text-slate-400"></i>
                            ${v.name}
                          </span>
                          <span class="font-mono text-brand-600 font-bold">${v.extraPrice > 0 ? `+$${v.extraPrice}` : 'Included ($0)'}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Subscription Plans Section -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-xl font-bold text-slate-900 tracking-tight">Recurring Billing Plans</h2>
                <p class="text-xs text-slate-500 mt-0.5">Cadences, minimum quantities, and automated closure/renewal rules</p>
              </div>
              ${this.data.currentUser.role === 'admin' ? `
                <button onclick="app.openNewPlanModal()" class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition-all">
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Plan
                </button>
              ` : ''}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              ${plans.map(pl => `
                <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between hover:border-brand-300 transition-all">
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">${pl.interval}</span>
                    <h3 class="text-base font-bold text-slate-900 mt-2">${pl.name}</h3>
                    <div class="mt-2 mb-3">
                      <span class="text-2xl font-extrabold text-slate-900 font-mono">$${pl.price}</span>
                      <span class="text-xs text-slate-400">/ cycle</span>
                    </div>
                    <p class="text-xs text-slate-500">Min Seats/Qty: <strong>${pl.minQty}</strong></p>
                  </div>

                  <div class="mt-4 pt-3 border-t border-slate-100 text-[11px] space-y-1 text-slate-600 font-medium">
                    <p class="flex items-center gap-1.5"><i data-lucide="${pl.autoCloseAtEnd ? 'check' : 'x'}" class="w-3.5 h-3.5 ${pl.autoCloseAtEnd ? 'text-emerald-500' : 'text-slate-300'}"></i> Auto-close at term end</p>
                    <p class="flex items-center gap-1.5"><i data-lucide="${pl.pausable ? 'check' : 'x'}" class="w-3.5 h-3.5 ${pl.pausable ? 'text-emerald-500' : 'text-slate-300'}"></i> Pausable by customer</p>
                    <p class="flex items-center gap-1.5"><i data-lucide="${pl.renewable ? 'check' : 'x'}" class="w-3.5 h-3.5 ${pl.renewable ? 'text-emerald-500' : 'text-slate-300'}"></i> Renewable on demand</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    openNewProductModal() {
      this.openModal(
        'Add New Product to Catalog',
        'Configure base prices and brand-specific add-on variants',
        `
          <form id="form-new-prod" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Product Name *</label>
              <input type="text" id="prod-name" required placeholder="e.g. Odoo Accounting Sync Adapter" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Type</label>
                <select id="prod-type" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <option value="software">Software</option>
                  <option value="service">Service</option>
                  <option value="hardware">Hardware</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Base Sales Price ($)</label>
                <input type="number" id="prod-price" min="0" value="500" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono">
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Notes / Description</label>
              <textarea id="prod-notes" rows="2" placeholder="Product specification..." class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"></textarea>
            </div>
          </form>
        `,
        `
          <button onclick="app.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onclick="app.submitNewProduct()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card">
            Add to Catalog
          </button>
        `
      );
    }

    submitNewProduct() {
      const name = document.getElementById('prod-name').value;
      const type = document.getElementById('prod-type').value;
      const price = parseFloat(document.getElementById('prod-price').value) || 0;
      const notes = document.getElementById('prod-notes').value || 'Standard offering';

      if (!name) return;

      const newProd = {
        id: `prod_${Date.now()}`,
        name: name,
        type: type,
        salesPrice: price,
        costPrice: Math.round(price * 0.4),
        notes: notes,
        variants: [
          { name: 'Standard Edition', extraPrice: 0 },
          { name: 'Odoo Enterprise Connector', extraPrice: 560 }
        ]
      };

      this.data.products.push(newProd);
      this.saveData();
      this.showToast(`Product "${name}" added to catalog!`, 'success');
      this.closeModal();
      this.navigateTo('products');
    }

    openNewPlanModal() {
      this.openModal(
        'Configure Billing Plan',
        'Set cycle intervals and lifecycle flags',
        `
          <form id="form-new-plan" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Plan Name *</label>
              <input type="text" id="plan-name" required placeholder="e.g. Quarterly Scale Plan" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Interval Cadence</label>
                <select id="plan-interval" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Price per Cycle ($)</label>
                <input type="number" id="plan-price" min="0" value="750" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Minimum Quantity</label>
                <input type="number" id="plan-min-qty" min="1" value="1" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono">
              </div>
              <div class="flex items-center gap-2 pt-4">
                <input type="checkbox" id="plan-pausable" checked class="rounded border-slate-300">
                <label for="plan-pausable" class="font-medium text-slate-700">Allow Pause / Resume</label>
              </div>
            </div>
          </form>
        `,
        `
          <button onclick="app.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onclick="app.submitNewPlan()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card">
            Save Billing Plan
          </button>
        `
      );
    }

    submitNewPlan() {
      const name = document.getElementById('plan-name').value;
      const interval = document.getElementById('plan-interval').value;
      const price = parseFloat(document.getElementById('plan-price').value) || 0;
      const minQty = parseInt(document.getElementById('plan-min-qty').value) || 1;
      const pausable = document.getElementById('plan-pausable').checked;

      if (!name) return;

      const newPlan = {
        id: `plan_${Date.now()}`,
        name: name,
        interval: interval,
        price: price,
        minQty: minQty,
        availableFrom: '2026-01-01',
        availableTo: '2028-12-31',
        autoCloseAtEnd: false,
        closableEarly: true,
        pausable: pausable,
        renewable: true
      };

      this.data.plans.push(newPlan);
      this.saveData();
      this.showToast(`Billing Plan "${name}" published!`, 'success');
      this.closeModal();
      this.navigateTo('products');
    }

    // ==========================================
    // 5. QUOTATIONS VIEW
    // ==========================================
    renderQuotations() {
      const quotations = this.data.quotations;

      return `
        <div class="space-y-6 animate-scale-up">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Quotations & Offers</h1>
              <p class="text-xs text-slate-500 mt-1">Generate proposals from templates and convert accepted quotes directly into active subscriptions.</p>
            </div>
            ${this.data.currentUser.role !== 'customer' ? `
              <button onclick="app.openNewQuotationModal()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card transition-all">
                <i data-lucide="plus" class="w-4 h-4"></i> New Quotation
              </button>
            ` : ''}
          </div>

          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th class="p-3.5">Quotation #</th>
                  <th class="p-3.5">Customer</th>
                  <th class="p-3.5">Template</th>
                  <th class="p-3.5">Valid Until</th>
                  <th class="p-3.5">Estimated Value</th>
                  <th class="p-3.5">Status</th>
                  <th class="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${quotations.map(q => {
                  const cust = this.data.customers.find(c => c.id === q.customerId);
                  return `
                    <tr class="table-hover-row">
                      <td class="p-3.5 font-bold text-slate-900">${q.number}</td>
                      <td class="p-3.5 font-semibold text-slate-800">${cust?.company || 'Prospect'}</td>
                      <td class="p-3.5 text-slate-600">${q.templateName}</td>
                      <td class="p-3.5 font-mono text-slate-500">${q.validUntil}</td>
                      <td class="p-3.5 font-bold text-slate-900 font-mono">$${q.totalAmount.toLocaleString()}</td>
                      <td class="p-3.5">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize badge-${q.status}">${q.status}</span>
                      </td>
                      <td class="p-3.5 text-right">
                        ${q.status !== 'converted' && this.data.currentUser.role !== 'customer' ? `
                          <button onclick="app.convertQuotationToSub('${q.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-all">
                            Convert to Subscription
                          </button>
                        ` : `
                          <span class="text-slate-400 text-[11px] font-medium">Converted ✅</span>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    convertQuotationToSub(quoteId) {
      const q = this.data.quotations.find(quote => quote.id === quoteId);
      if (!q) return;

      const nextNum = `SUB-2026-${String(this.data.subscriptions.length + 1).padStart(3, '0')}`;
      const newSub = {
        id: `sub_${Date.now()}`,
        number: nextNum,
        customerId: q.customerId,
        planId: q.planId || 'plan_1',
        status: 'active',
        startDate: '2026-11-01',
        expiryDate: '2027-11-01',
        nextBillingDate: '2026-11-01',
        paymentTerms: 'Net 15',
        discountCode: null,
        lines: q.lines.map(l => ({ ...l, taxId: 'tax_1' })),
        subtotal: q.totalAmount,
        discountAmount: 0,
        taxAmount: q.totalAmount * 0.18,
        totalAmount: q.totalAmount * 1.18
      };

      q.status = 'converted';
      this.data.subscriptions.unshift(newSub);
      this.saveData();
      this.showToast(`Quotation ${q.number} converted into Active Subscription ${nextNum}!`, 'success');
      this.navigateTo('subscriptions');
    }

    openNewQuotationModal() {
      const customers = this.data.customers;
      this.openModal(
        'Generate Quotation Proposal',
        'Create formal pricing quotation from template lines',
        `
          <form id="form-new-quote" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Target Customer / Account</label>
              <select id="quote-cust-id" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
                ${customers.map(c => `<option value="${c.id}">${c.company} (${c.name})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Quotation Template</label>
              <select id="quote-template-name" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
                <option value="Enterprise SaaS Starter">Enterprise SaaS Starter (Core + 2 AI Agents)</option>
                <option value="Odoo Partner Deployment Package">Odoo Partner Deployment Package (Core + Odoo Connector)</option>
                <option value="Autonomous Cluster Scale">Autonomous Cluster Scale (High Performance)</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Quotation Validity (Days)</label>
                <input type="number" id="quote-validity-days" min="1" value="30" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Estimated Value ($)</label>
                <input type="number" id="quote-amount" min="100" value="2100" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono">
              </div>
            </div>
          </form>
        `,
        `
          <button onclick="app.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onclick="app.submitNewQuotation()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card">
            Generate Quotation
          </button>
        `
      );
    }

    submitNewQuotation() {
      const custId = document.getElementById('quote-cust-id').value;
      const tName = document.getElementById('quote-template-name').value;
      const amount = parseFloat(document.getElementById('quote-amount').value) || 2000;
      const num = `QUO-2026-${String(this.data.quotations.length + 1).padStart(3, '0')}`;

      const newQ = {
        id: `quote_${Date.now()}`,
        number: num,
        customerId: custId,
        templateName: tName,
        planId: 'plan_1',
        validUntil: '2026-11-30',
        status: 'sent',
        lines: [
          { productId: 'prod_1', variant: 'Standard Edition', qty: 1, unitPrice: amount }
        ],
        totalAmount: amount
      };

      this.data.quotations.unshift(newQ);
      this.saveData();
      this.showToast(`Quotation ${num} sent to prospect!`, 'success');
      this.closeModal();
      this.navigateTo('quotations');
    }

    // ==========================================
    // 6. INVOICE MANAGEMENT VIEW
    // ==========================================
    renderInvoices() {
      let invoices = this.data.invoices;

      if (this.data.currentUser.role === 'customer') {
        invoices = invoices.filter(i => i.customerId === this.data.currentUser.id);
      }

      return `
        <div class="space-y-6 animate-scale-up">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Invoices & Billing</h1>
              <p class="text-xs text-slate-500 mt-1">Generated automatically from subscriptions with automated tax, discounts, and print/PDF support.</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="app.runAutomatedBillingEngine()" class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-bold transition-all shadow-subtle">
                <i data-lucide="play" class="w-4 h-4 fill-amber-600 text-amber-600"></i> Run Billing Engine
              </button>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th class="p-3.5">Invoice #</th>
                  <th class="p-3.5">Customer</th>
                  <th class="p-3.5">Billing Period</th>
                  <th class="p-3.5">Due Date</th>
                  <th class="p-3.5">Total Amount</th>
                  <th class="p-3.5">Balance Due</th>
                  <th class="p-3.5">Status</th>
                  <th class="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${invoices.map(inv => {
                  const cust = this.data.customers.find(c => c.id === inv.customerId);
                  const bal = Math.max(0, inv.totalAmount - (inv.paidAmount || 0));
                  return `
                    <tr class="table-hover-row">
                      <td class="p-3.5 font-bold text-slate-900">${inv.number}</td>
                      <td class="p-3.5">
                        <p class="font-semibold text-slate-800">${cust?.company || cust?.name || 'Direct'}</p>
                      </td>
                      <td class="p-3.5 text-slate-500 font-mono text-[11px]">${inv.billingPeriod}</td>
                      <td class="p-3.5 font-mono text-slate-600">${inv.dueDate}</td>
                      <td class="p-3.5 font-bold text-slate-900 font-mono">$${inv.totalAmount.toLocaleString()}</td>
                      <td class="p-3.5 font-mono font-bold ${bal > 0 ? 'text-rose-600' : 'text-emerald-600'}">
                        $${bal.toLocaleString()}
                      </td>
                      <td class="p-3.5">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize badge-${inv.status}">${inv.status}</span>
                      </td>
                      <td class="p-3.5 text-right">
                        <div class="inline-flex items-center gap-1.5">
                          <button onclick="app.previewPrintInvoice('${inv.id}')" title="View / Print PDF" class="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100">
                            <i data-lucide="printer" class="w-4 h-4"></i>
                          </button>
                          ${bal > 0 && this.data.currentUser.role !== 'customer' ? `
                            <button onclick="app.openRecordPaymentModal('${inv.id}')" title="Record Payment" class="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-[11px]">
                              Pay
                            </button>
                          ` : ''}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    previewPrintInvoice(invId) {
      const inv = this.data.invoices.find(i => i.id === invId);
      if (!inv) return;
      const cust = this.data.customers.find(c => c.id === inv.customerId);

      const html = `
        <div class="space-y-8 font-sans text-slate-800">
          <!-- Invoice Header -->
          <div class="flex items-start justify-between border-b border-slate-200 pb-8">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-xl shadow-glow">
                <i data-lucide="repeat" class="w-6 h-6"></i>
              </div>
              <div>
                <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Brightloop Software</h1>
                <p class="text-xs text-slate-400">Enterprise Recurring Revenue Infrastructure</p>
                <p class="text-xs text-slate-400 mt-0.5">VAT/Tax ID: BL-89102934-US</p>
              </div>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest block">Official Tax Invoice</span>
              <p class="text-xl font-mono font-extrabold text-slate-900 mt-1">${inv.number}</p>
              <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider badge-${inv.status}">
                ${inv.status}
              </span>
            </div>
          </div>

          <!-- Bill-to and Dates -->
          <div class="grid grid-cols-2 gap-8 text-xs">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Invoiced To:</p>
              <h3 class="text-sm font-bold text-slate-900">${cust?.company || cust?.name}</h3>
              <p class="text-slate-600 font-medium">${cust?.name || ''}</p>
              <p class="text-slate-500">${cust?.email || ''}</p>
              <p class="text-slate-500">${cust?.address || 'Billing Address On File'}</p>
            </div>
            <div class="text-right space-y-1 font-mono">
              <p><span class="text-slate-400">Invoice Date:</span> <strong>${inv.issueDate}</strong></p>
              <p><span class="text-slate-400">Due Date:</span> <strong class="text-slate-900">${inv.dueDate}</strong></p>
              <p><span class="text-slate-400">Billing Period:</span> <strong>${inv.billingPeriod}</strong></p>
            </div>
          </div>

          <!-- Invoice Line Items Table -->
          <div class="border border-slate-200 rounded-2xl overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th class="p-3.5">Line Description</th>
                  <th class="p-3.5 text-center">Qty</th>
                  <th class="p-3.5 text-right">Unit Price</th>
                  <th class="p-3.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                ${inv.lines.map(line => `
                  <tr>
                    <td class="p-3.5 text-slate-900 font-semibold">${line.description}</td>
                    <td class="p-3.5 text-center">${line.qty}</td>
                    <td class="p-3.5 text-right font-mono">$${line.unitPrice.toFixed(2)}</td>
                    <td class="p-3.5 text-right font-mono font-bold">$${line.amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Total Calculation Ledger -->
          <div class="flex justify-end text-xs">
            <div class="w-72 space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 font-mono">
              <div class="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>$${inv.subtotal.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-emerald-600">
                <span>Discounts Applied:</span>
                <span>-$${inv.discountAmount.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>Tax Rules (GST/VAT):</span>
                <span>+$${inv.taxAmount.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-slate-900 font-extrabold text-base pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span>$${inv.totalAmount.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-emerald-600 pt-1">
                <span>Paid / Settled:</span>
                <span>$${(inv.paidAmount || 0).toFixed(2)}</span>
              </div>
              <div class="flex justify-between font-bold text-rose-600 pt-1 border-t border-slate-200">
                <span>Balance Outstanding:</span>
                <span>$${Math.max(0, inv.totalAmount - (inv.paidAmount || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <!-- Footer Stamp & Notes -->
          <div class="border-t border-slate-100 pt-6 text-[11px] text-slate-400 flex items-center justify-between">
            <p>Thank you for partnering with Brightloop Software. Payment terms strictly apply.</p>
            <p class="font-mono">Generated by Brightloop Idempotent Billing Engine</p>
          </div>
        </div>
      `;

      document.getElementById('invoice-printable-content').innerHTML = html;
      document.getElementById('invoice-modal').classList.remove('hidden');
      document.getElementById('invoice-modal').classList.add('flex');
      lucide.createIcons();
    }

    closeInvoiceModal() {
      document.getElementById('invoice-modal').classList.add('hidden');
      document.getElementById('invoice-modal').classList.remove('flex');
    }

    // ==========================================
    // 7. PAYMENTS VIEW
    // ==========================================
    renderPayments() {
      let payments = this.data.payments;
      if (this.data.currentUser.role === 'customer') {
        payments = payments.filter(p => p.customerId === this.data.currentUser.id);
      }

      return `
        <div class="space-y-6 animate-scale-up">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Payments & Settlement</h1>
              <p class="text-xs text-slate-500 mt-1">Reconciliation ledger linked directly to open invoices.</p>
            </div>
            ${this.data.currentUser.role !== 'customer' ? `
              <button onclick="app.openRecordPaymentModal()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card transition-all">
                <i data-lucide="plus" class="w-4 h-4"></i> Record New Payment
              </button>
            ` : ''}
          </div>

          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th class="p-3.5">Payment Ref #</th>
                  <th class="p-3.5">Invoice #</th>
                  <th class="p-3.5">Customer</th>
                  <th class="p-3.5">Payment Method</th>
                  <th class="p-3.5">Date Settled</th>
                  <th class="p-3.5">Amount</th>
                  <th class="p-3.5">Notes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${payments.map(p => {
                  const cust = this.data.customers.find(c => c.id === p.customerId);
                  const inv = this.data.invoices.find(i => i.id === p.invoiceId);
                  return `
                    <tr class="table-hover-row">
                      <td class="p-3.5 font-bold font-mono text-slate-900">${p.reference}</td>
                      <td class="p-3.5 font-bold text-brand-600">${inv?.number || 'Direct Payment'}</td>
                      <td class="p-3.5 font-medium text-slate-800">${cust?.company || cust?.name || 'Customer'}</td>
                      <td class="p-3.5">
                        <span class="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">${p.method}</span>
                      </td>
                      <td class="p-3.5 font-mono text-slate-500">${p.date}</td>
                      <td class="p-3.5 font-bold font-mono text-emerald-600">+$${p.amount.toLocaleString()}</td>
                      <td class="p-3.5 text-slate-400 text-[11px]">${p.notes}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    openRecordPaymentModal(preselectedInvId = '') {
      const openInvoices = this.data.invoices.filter(i => i.status !== 'paid');

      this.openModal(
        'Record Invoice Payment',
        'Settle open invoices and log reconciliation reference',
        `
          <form id="form-record-pay" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Target Invoice *</label>
              <select id="pay-inv-id" required class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
                ${openInvoices.map(inv => {
                  const cust = this.data.customers.find(c => c.id === inv.customerId);
                  const bal = inv.totalAmount - (inv.paidAmount || 0);
                  const sel = inv.id === preselectedInvId ? 'selected' : '';
                  return `<option value="${inv.id}" ${sel}>${inv.number} — ${cust?.company} (Bal: $${bal})</option>`;
                }).join('')}
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Payment Amount ($) *</label>
                <input type="number" id="pay-amount" min="1" step="0.01" value="531.00" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select id="pay-method" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <option value="Stripe Credit Card">Stripe Credit Card</option>
                  <option value="Wire Transfer / ACH">Wire Transfer / ACH</option>
                  <option value="UPI / Direct Bank">UPI / Direct Bank</option>
                  <option value="Cheque / Cash">Cheque / Cash</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Reference / Transaction ID</label>
                <input type="text" id="pay-ref" value="TX-${Date.now().toString().slice(-6)}" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Settlement Date</label>
                <input type="date" id="pay-date" value="2026-10-31" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Notes / Reconciliation Remarks</label>
              <input type="text" id="pay-notes" placeholder="e.g. Bank statement match" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
            </div>
          </form>
        `,
        `
          <button onclick="app.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onclick="app.submitRecordPayment()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-card">
            Record & Settle Payment
          </button>
        `
      );
    }

    submitRecordPayment() {
      const invId = document.getElementById('pay-inv-id').value;
      const amount = parseFloat(document.getElementById('pay-amount').value) || 0;
      const method = document.getElementById('pay-method').value;
      const ref = document.getElementById('pay-ref').value;
      const date = document.getElementById('pay-date').value;
      const notes = document.getElementById('pay-notes').value || 'Settled in full';

      const inv = this.data.invoices.find(i => i.id === invId);
      if (!inv) return;

      inv.paidAmount = (inv.paidAmount || 0) + amount;
      if (inv.paidAmount >= inv.totalAmount) {
        inv.status = 'paid';
      }

      this.data.payments.unshift({
        id: `pay_${Date.now()}`,
        invoiceId: invId,
        customerId: inv.customerId,
        amount: amount,
        method: method,
        date: date,
        reference: ref,
        notes: notes
      });

      this.data.activityLog.unshift({
        id: `act_${Date.now()}`,
        action: 'Payment Captured',
        target: `$${amount} on ${inv.number}`,
        user: this.data.currentUser.name,
        time: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });

      this.saveData();
      this.showToast(`Payment of $${amount} recorded for ${inv.number}!`, 'success');
      this.closeModal();
      this.navigateTo('payments');
    }

    // ==========================================
    // 8. DISCOUNTS & TAXES VIEW
    // ==========================================
    renderDiscounts() {
      return `
        <div class="space-y-6 animate-scale-up">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Discount Rules Engine</h1>
              <p class="text-xs text-slate-500 mt-1">Admin-configured discount promotions with usage counters and minimum spend requirements.</p>
            </div>
            ${this.data.currentUser.role === 'admin' ? `
              <button onclick="app.openNewDiscountModal()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card transition-all">
                <i data-lucide="plus" class="w-4 h-4"></i> Create Discount Rule
              </button>
            ` : ''}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${this.data.discounts.map(d => `
              <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 border border-brand-200/60">${d.code}</span>
                    <span class="text-[10px] font-bold uppercase text-slate-400">${d.type}</span>
                  </div>
                  <h3 class="text-sm font-bold text-slate-900 mt-2">${d.name}</h3>
                  <p class="text-xl font-mono font-extrabold text-brand-600 mt-1">
                    ${d.type === 'percentage' ? `${d.value}% OFF` : `$${d.value} FLAT`}
                  </p>
                  <div class="mt-3 space-y-1 text-slate-500 text-xs">
                    <p>Min Purchase: <strong>$${d.minPurchase}</strong></p>
                    <p>Usage: <strong>${d.usageCount} / ${d.usageLimit} redeemed</strong></p>
                    <p>Valid until: <strong>${d.validUntil}</strong></p>
                  </div>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Scope: ${d.scope === 'all' ? 'All Plans & Products' : 'Product Specific'}</span>
                  <span class="text-emerald-600 font-bold">Active</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    openNewDiscountModal() {
      this.openModal(
        'Create Discount Rule',
        'Define fixed or percentage discount with eligibility criteria',
        `
          <form id="form-new-disc" class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Coupon Code *</label>
                <input type="text" id="disc-code" placeholder="e.g. WINTER25" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold uppercase">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Discount Type</label>
                <select id="disc-type" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Discount Value *</label>
                <input type="number" id="disc-val" value="20" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Min Purchase Amount ($)</label>
                <input type="number" id="disc-min" value="500" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono">
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Usage Limit</label>
              <input type="number" id="disc-limit" value="50" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono">
            </div>
          </form>
        `,
        `
          <button onclick="app.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onclick="app.submitNewDiscount()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card">
            Publish Discount Rule
          </button>
        `
      );
    }

    submitNewDiscount() {
      const code = document.getElementById('disc-code').value.toUpperCase();
      const type = document.getElementById('disc-type').value;
      const val = parseFloat(document.getElementById('disc-val').value) || 10;
      const min = parseFloat(document.getElementById('disc-min').value) || 0;
      const limit = parseInt(document.getElementById('disc-limit').value) || 100;

      if (!code) return;

      this.data.discounts.push({
        id: `disc_${Date.now()}`,
        code: code,
        name: `${val}${type === 'percentage' ? '%' : '$'} Special Promotion`,
        type: type,
        value: val,
        minPurchase: min,
        minQty: 1,
        usageLimit: limit,
        usageCount: 0,
        validUntil: '2026-12-31',
        scope: 'all'
      });

      this.saveData();
      this.showToast(`Discount rule ${code} activated!`, 'success');
      this.closeModal();
      this.navigateTo('discounts');
    }

    renderTaxes() {
      return `
        <div class="space-y-6 animate-scale-up">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Tax & Regional Rates</h1>
              <p class="text-xs text-slate-500 mt-1">Multi-jurisdiction tax engine automatically applied on generated invoices.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${this.data.taxes.map(t => `
              <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-slate-900">${t.name}</h3>
                    ${t.isDefault ? '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700">Default</span>' : ''}
                  </div>
                  <p class="text-xs text-slate-400 mt-1">Region: ${t.region}</p>
                </div>
                <div class="text-right">
                  <span class="text-2xl font-extrabold font-mono text-slate-900">${t.rate}%</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // ==========================================
    // 9. REPORTS & ANALYTICS VIEW
    // ==========================================
    renderReports() {
      const metrics = this.calculateMetrics();

      return `
        <div class="space-y-6 animate-scale-up">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Reports & Exports</h1>
              <p class="text-xs text-slate-500 mt-1">Executive summaries, cohort retention, and audit logs.</p>
            </div>
            <button onclick="app.exportLedgerCSV()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-card transition-all">
              <i data-lucide="download" class="w-4 h-4"></i> Export Ledger to CSV
            </button>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
            <h4 class="font-bold text-slate-900 text-sm mb-4">Quarterly Revenue Collection Analysis</h4>
            <div class="h-64">
              <canvas id="chart-reports-bar"></canvas>
            </div>
          </div>

          <!-- Audit Activity Log -->
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
            <div class="p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 class="font-bold text-slate-900 text-sm">System Audit Trail</h4>
              <span class="text-xs text-slate-400 font-mono">Immutable Log</span>
            </div>
            <div class="divide-y divide-slate-100">
              ${this.data.activityLog.map(act => `
                <div class="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span class="font-bold text-slate-800">${act.action}</span>
                    <span class="text-slate-400 ml-2 font-mono">Target: ${act.target}</span>
                  </div>
                  <div class="text-right text-slate-400">
                    <span class="font-medium text-slate-600">${act.user}</span> • ${act.time}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    initReportsCharts() {
      const ctx = document.getElementById('chart-reports-bar')?.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026 (Est)'],
            datasets: [
              {
                label: 'Invoiced Revenue ($)',
                data: [92000, 114000, 138000, 155000],
                backgroundColor: '#6366f1',
                borderRadius: 8
              },
              {
                label: 'Cash Settled ($)',
                data: [88000, 108000, 132000, 142000],
                backgroundColor: '#10b981',
                borderRadius: 8
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } }
          }
        });
      }
    }

    exportLedgerCSV() {
      let csv = 'Invoice Number,Customer,Billing Period,Total Amount,Paid Amount,Status,Due Date\n';
      this.data.invoices.forEach(inv => {
        const cust = this.data.customers.find(c => c.id === inv.customerId);
        csv += `"${inv.number}","${cust?.company || cust?.name}","${inv.billingPeriod}",${inv.totalAmount},${inv.paidAmount || 0},"${inv.status}","${inv.dueDate}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Brightloop_Invoices_Ledger_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.showToast('CSV Export downloaded successfully!', 'success');
    }

    // ==========================================
    // 10. SETTINGS & TEAM MANAGEMENT VIEW
    // ==========================================
    renderSettings() {
      return `
        <div class="space-y-6 animate-scale-up">
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Organization & Team Governance</h1>
            <p class="text-xs text-slate-500 mt-1">Manage staff access roles, system configurations, and reset sandbox data.</p>
          </div>

          <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <div class="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 class="text-sm font-bold text-slate-900">Brightloop Software Team Members</h3>
                <p class="text-xs text-slate-400">Team members with portal access and credentials</p>
              </div>
              ${this.data.currentUser.role === 'admin' ? `
                <button onclick="app.openNewStaffModal()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition-all">
                  <i data-lucide="user-plus" class="w-3.5 h-3.5"></i> Add Staff
                </button>
              ` : ''}
            </div>

            <div class="divide-y divide-slate-100">
              ${this.data.staffList.map(stf => `
                <div class="py-3 flex items-center justify-between text-xs">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                      ${stf.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">${stf.name}</p>
                      <p class="text-slate-400 text-[11px]">${stf.email}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${stf.role === 'admin' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-700'}">
                      ${stf.role}
                    </span>
                    <span class="text-slate-400 text-[11px]">Joined ${stf.joined}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="bg-rose-50/50 p-6 rounded-2xl border border-rose-200/70 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-rose-900">Reset Demo Data</h3>
              <p class="text-xs text-rose-600 mt-0.5">Wipes local modifications and restores clean hackathon seed dataset.</p>
            </div>
            <button onclick="app.resetDemoData()" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-subtle transition-all">
              Reset Sandbox
            </button>
          </div>
        </div>
      `;
    }

    openNewStaffModal() {
      this.openModal(
        'Add Internal Staff Member',
        'Create staff account with role-based operational permissions',
        `
          <form id="form-new-staff" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Staff Member Full Name *</label>
              <input type="text" id="staff-name" required placeholder="e.g. Vijay Sharma" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input type="email" id="staff-email" required placeholder="staff@brightloop.test" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Role Assignment</label>
              <select id="staff-role" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
                <option value="staff">Internal Staff (Operational Access)</option>
                <option value="admin">Administrator (Full Control)</option>
              </select>
            </div>
          </form>
        `,
        `
          <button onclick="app.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onclick="app.submitNewStaff()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card">
            Authorize Staff Member
          </button>
        `
      );
    }

    submitNewStaff() {
      const name = document.getElementById('staff-name').value;
      const email = document.getElementById('staff-email').value;
      const role = document.getElementById('staff-role').value;

      if (!name || !email) return;

      this.data.staffList.push({
        id: `stf_${Date.now()}`,
        name: name,
        email: email,
        role: role,
        joined: new Date().toISOString().substring(0, 10)
      });

      this.saveData();
      this.showToast(`Staff member "${name}" registered!`, 'success');
      this.closeModal();
      this.navigateTo('settings');
    }

    // ==========================================
    // 11. AUTOMATED BILLING ENGINE (Idempotent Exactly-Once Run)
    // ==========================================
    runAutomatedBillingEngine() {
      const activeSubs = this.data.subscriptions.filter(s => s.status === 'active');
      let createdCount = 0;
      let skippedCount = 0;

      const currentPeriod = '2026-11-01 to 2026-11-30';

      activeSubs.forEach(sub => {
        // Check for existing invoice for this period (Idempotency guarantee)
        const alreadyInvoiced = this.data.invoices.some(
          inv => inv.subscriptionId === sub.id && inv.billingPeriod === currentPeriod
        );

        if (alreadyInvoiced) {
          skippedCount++;
          return;
        }

        const nextNum = `INV-2026-${String(this.data.invoices.length + 1).padStart(3, '0')}`;
        const newInv = {
          id: `inv_${Date.now()}_${sub.id}`,
          number: nextNum,
          subscriptionId: sub.id,
          customerId: sub.customerId,
          billingPeriod: currentPeriod,
          issueDate: '2026-11-01',
          dueDate: '2026-11-15',
          status: 'confirmed',
          subtotal: sub.subtotal,
          discountAmount: sub.discountAmount,
          taxAmount: sub.taxAmount,
          totalAmount: sub.totalAmount,
          paidAmount: 0,
          lines: sub.lines.map(line => {
            const prod = this.data.products.find(p => p.id === line.productId);
            return {
              description: `${prod?.name || 'Product'} (${line.variant || 'Standard'})`,
              qty: line.qty,
              unitPrice: line.unitPrice,
              amount: line.qty * line.unitPrice
            };
          })
        };

        this.data.invoices.unshift(newInv);
        createdCount++;
      });

      if (createdCount > 0) {
        this.data.notifications.unshift({
          id: `notif_${Date.now()}`,
          title: `Billing Run Completed: ${createdCount} invoices generated (Idempotent check: ${skippedCount} skipped)`,
          time: 'Just now',
          type: 'success'
        });
        this.saveData();
        this.showToast(`Billing Run: ${createdCount} invoices created with exactly-once guarantee!`, 'success');
      } else {
        this.showToast(`Idempotent Billing: All ${activeSubs.length} active subscriptions already billed for ${currentPeriod}. Zero duplicate invoices.`, 'info');
      }

      this.navigateTo(this.currentPage);
    }

    generateInvoiceFromSub(subId) {
      const sub = this.data.subscriptions.find(s => s.id === subId);
      if (!sub) return;

      const currentPeriod = '2026-11-01 to 2026-11-30';
      const nextNum = `INV-2026-${String(this.data.invoices.length + 1).padStart(3, '0')}`;
      const newInv = {
        id: `inv_${Date.now()}`,
        number: nextNum,
        subscriptionId: sub.id,
        customerId: sub.customerId,
        billingPeriod: currentPeriod,
        issueDate: '2026-11-01',
        dueDate: '2026-11-15',
        status: 'confirmed',
        subtotal: sub.subtotal,
        discountAmount: sub.discountAmount,
        taxAmount: sub.taxAmount,
        totalAmount: sub.totalAmount,
        paidAmount: 0,
        lines: sub.lines.map(line => {
          const prod = this.data.products.find(p => p.id === line.productId);
          return {
            description: `${prod?.name || 'Item'} (${line.variant || 'Standard'})`,
            qty: line.qty,
            unitPrice: line.unitPrice,
            amount: line.qty * line.unitPrice
          };
        })
      };

      this.data.invoices.unshift(newInv);
      this.saveData();
      this.closeModal();
      this.showToast(`Invoice ${nextNum} generated from ${sub.number}!`, 'success');
      this.navigateTo('invoices');
    }

    // ==========================================
    // 12. UNIVERSAL MODAL & COMMAND PALETTE
    // ==========================================
    openModal(title, subtitle, bodyHtml, footerHtml) {
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-subtitle').textContent = subtitle;
      document.getElementById('modal-body').innerHTML = bodyHtml;
      document.getElementById('modal-footer').innerHTML = footerHtml;

      const container = document.getElementById('modal-container');
      container.classList.remove('hidden');
      container.classList.add('flex');
      lucide.createIcons();
    }

    closeModal() {
      const container = document.getElementById('modal-container');
      container.classList.add('hidden');
      container.classList.remove('flex');
    }

    toggleCommandPalette(show) {
      const pal = document.getElementById('command-palette');
      const input = document.getElementById('palette-search');
      if (show) {
        pal.classList.remove('hidden');
        pal.classList.add('flex');
        input.value = '';
        input.focus();
        this.filterCommandPalette('');
      } else {
        pal.classList.add('hidden');
        pal.classList.remove('flex');
      }
    }

    filterCommandPalette(q) {
      const resultsContainer = document.getElementById('palette-results');
      const query = q.toLowerCase();

      const items = [
        { title: 'Dashboard', page: 'dashboard', icon: 'layout-dashboard', cat: 'Navigation' },
        { title: 'Subscriptions', page: 'subscriptions', icon: 'refresh-cw', cat: 'Navigation' },
        { title: 'Customers', page: 'customers', icon: 'users', cat: 'Navigation' },
        { title: 'Products & Plans', page: 'products', icon: 'package', cat: 'Navigation' },
        { title: 'Quotations', page: 'quotations', icon: 'file-text', cat: 'Navigation' },
        { title: 'Invoices', page: 'invoices', icon: 'receipt', cat: 'Navigation' },
        { title: 'Payments', page: 'payments', icon: 'credit-card', cat: 'Navigation' },
        { title: 'Discounts', page: 'discounts', icon: 'tag', cat: 'Navigation' },
        { title: 'Taxes', page: 'taxes', icon: 'percent', cat: 'Navigation' },
        { title: 'Reports & Analytics', page: 'reports', icon: 'bar-chart-3', cat: 'Navigation' },
        { title: 'Settings & Staff', page: 'settings', icon: 'settings', cat: 'Navigation' }
      ];

      const filtered = items.filter(i => i.title.toLowerCase().includes(query) || i.cat.toLowerCase().includes(query));

      resultsContainer.innerHTML = filtered.map(item => `
        <button onclick="app.selectPaletteItem('${item.page}')" class="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs transition-all">
          <div class="flex items-center gap-3">
            <div class="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <i data-lucide="${item.icon}" class="w-4 h-4"></i>
            </div>
            <span class="font-bold text-slate-800">${item.title}</span>
          </div>
          <span class="text-[10px] text-slate-400 font-medium">${item.cat}</span>
        </button>
      `).join('');
      lucide.createIcons();
    }

    selectPaletteItem(page) {
      this.toggleCommandPalette(false);
      this.navigateTo(page);
    }

    showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      
      const colors = {
        success: 'bg-emerald-600 text-white shadow-emerald-500/20',
        error: 'bg-rose-600 text-white shadow-rose-500/20',
        warning: 'bg-amber-600 text-white shadow-amber-500/20',
        info: 'bg-slate-900 text-white shadow-slate-900/20'
      };

      toast.className = `px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2.5 pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0 ${colors[type] || colors.info}`;
      toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info'}" class="w-4 h-4"></i>
        <span>${message}</span>
      `;

      container.appendChild(toast);
      lucide.createIcons();

      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      });

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    showAuthModal(mode = 'login') {
      this.openModal(
        mode === 'login' ? 'Authentication / Sign In' : 'Account Registration',
        'Role-aware access control for Admin, Staff and Customers',
        `
          <div class="space-y-3 text-xs">
            <p class="text-slate-500">Quick sign-in credentials for testing:</p>
            <div class="space-y-1.5 font-mono text-[11px]">
              <div onclick="app.fillLogin('admin@brightloop.test')" class="p-2 rounded-lg bg-slate-50 hover:bg-brand-50 border border-slate-200 cursor-pointer flex justify-between">
                <span>👑 Admin: admin@brightloop.test</span>
                <span class="text-brand-600 font-bold">Click to use</span>
              </div>
              <div onclick="app.fillLogin('shivambw3011@gmail.com')" class="p-2 rounded-lg bg-slate-50 hover:bg-brand-50 border border-slate-200 cursor-pointer flex justify-between">
                <span>💼 Staff: shivambw3011@gmail.com</span>
                <span class="text-brand-600 font-bold">Click to use</span>
              </div>
              <div onclick="app.fillLogin('customer@brightloop.test')" class="p-2 rounded-lg bg-slate-50 hover:bg-brand-50 border border-slate-200 cursor-pointer flex justify-between">
                <span>🏢 Customer: customer@brightloop.test</span>
                <span class="text-brand-600 font-bold">Click to use</span>
              </div>
            </div>

            <form id="form-auth" class="space-y-3 pt-2">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Email</label>
                <input type="email" id="auth-email" value="admin@brightloop.test" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-medium">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Password</label>
                <input type="password" id="auth-password" value="Admin@1234" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2">
              </div>
            </form>
          </div>
        `,
        `
          <button onclick="app.closeModal()" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onclick="app.submitAuth()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-card">
            Sign In
          </button>
        `
      );
    }

    fillLogin(email) {
      document.getElementById('auth-email').value = email;
    }

    submitAuth() {
      const email = document.getElementById('auth-email').value;
      if (email.includes('admin')) {
        this.switchRole('admin');
      } else if (email.includes('shivam') || email.includes('staff')) {
        this.switchRole('staff');
      } else {
        this.switchRole('customer');
      }
      this.closeModal();
    }
  }

  // Instantiate and attach to global window
  window.app = new BrightloopApp();
})();
