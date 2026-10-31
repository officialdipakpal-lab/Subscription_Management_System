# 🔁 Brightloop Subscription Management System

> **Enterprise AI-first recurring revenue platform: Products & Variants → Plans → Quotation Templates → Subscriptions → Automated Invoicing → Payments & Revenue Insights.**

![status](https://img.shields.io/badge/status-hackathon%20build-blue)
![roles](https://img.shields.io/badge/roles-Admin%20%7C%20Staff%20%7C%20Customer-success)
![perf](https://img.shields.io/badge/page%20response-%3C%202s-brightgreen)
![billing](https://img.shields.io/badge/billing-idempotent%20%26%20exactly--once-orange)
![design](https://img.shields.io/badge/ui%2Fux-Stripe%20%7C%20Linear%20inspired-indigo)

---

## 📌 Table of Contents
1. [The Problem & Mission](#-the-problem--mission)
2. [Our Solution](#-our-solution)
3. [Design System & UI/UX](#-design-system--uiux)
4. [Feature Walkthrough: A Month at Brightloop](#-feature-walkthrough-a-month-at-brightloop)
5. [System Architecture & Data Model](#-system-architecture--data-model)
6. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
7. [The Idempotent Billing Engine](#-the-idempotent-billing-engine)
8. [Pricing, Variants & Tax Engine](#-pricing-variants--tax-engine)
9. [Instant Run (Zero Dependencies)](#-instant-run-zero-dependencies)
10. [Demo Script (5-Minute Presentation)](#-demo-script-5-minute-presentation)
11. [👥 Team Members](#-team-members)

---

## 🎯 The Problem & Mission

Brightloop Software sells everything on subscription, but traditionally tracked recurring revenue manually:
* ⚠️ **Subscriptions in spreadsheets**: No single source of truth across team.
* ⚠️ **Missed renewals**: Subscriptions expired unnoticed, leading to lost revenue.
* ⚠️ **Double billing & manual errors**: Typing monthly invoices led to incorrect amounts.
* ⚠️ **Slow payment reconciliation**: Scrolling bank statements to verify who paid.
* ⚠️ **Unknown real-time MRR/ARR**: Financial reporting took weeks to compile.

---

## 💡 Our Solution

A modern, role-aware SaaS platform that **automates the full recurring-revenue loop**:
- ✅ **Zero manual invoicing**: Invoices generated automatically from subscriptions, with pre-calculated taxes, discounts, and line totals.
- ✅ **Exactly-once billing**: Idempotent billing execution prevents double billing and ensures no due subscription is skipped.
- ✅ **Brand variants**: Add-on variant pricing (e.g., choosing the *Odoo* brand variant adds +$560 to base price).
- ✅ **Self-service portal**: Customers manage their own subscriptions, review invoices, and track payments without emailing support.
- ✅ **Real-time executive dashboard**: Instant MRR, ARR, active contracts, overdue aging, and payment reconciliation in under 2 seconds.

---

## 🎨 Design System & UI/UX

Inspired by **Stripe, Linear, and Razorpay**:
- **Colors**: Crisp clean white canvas (`#ffffff`), subtle slate backgrounds (`#f8fafc`), indigo/violet brand gradients (`#6366f1` to `#4f46e5`), emerald accents for settled items, amber for alerts, and rose for overdue.
- **Typography**: Plus Jakarta Sans & Inter with JetBrains Mono for monetary values and invoice reference IDs.
- **Components**: Pill status badges, glassmorphic header, collapsible sidebar, interactive Chart.js analytics, command palette (`Ctrl + K`), and print-ready tax invoices.

---

## 🗓️ Feature Walkthrough: *A Month at Brightloop*

### 1. 👤 Auth & RBAC
- **Roles**: Admin (full governance), Internal Staff (day-to-day operations), and Customer (portal view).
- **Interactive Quick Switcher**: Test all roles instantly from the top header or sidebar.

### 2. 🚀 Product Catalog & Odoo Variants
- Products configured with sales price, cost price, margins, and variants.
- Choosing the **Odoo Enterprise Connector** variant adds **+$560** to the subscription line item.

### 3. 📝 Quotations to Subscriptions
- Sales representatives start from **Quotation Templates**.
- One-click **"Convert to Subscription"** flips approved quotes into active recurring contracts.

### 4. 🧾 Automated Billing Day
- Automated billing job runs across all active contracts.
- **Idempotency Guarantee**: If run multiple times in the same billing cycle, duplicate invoices are strictly prevented.

### 5. 🏷️ Admin Discount & Tax Rules
- Fixed or percentage discounts with minimum spend rules and usage limits (e.g. `LAUNCH15` 15% off).
- Multi-jurisdiction tax engine (GST 18%, VAT 5%, Sales Tax 8.25%).

### 6. 💳 Payment Settlement & PDF Invoices
- Record payments with transaction references and payment methods.
- View, preview, and print formal tax invoices with PDF export capabilities.

---

## 🚀 Instant Run (Zero Dependencies)

The application includes an **instant standalone Single Page Application** that runs on any machine with zero installation or build steps:

1. Double-click or open **`index.html`** in any web browser (Google Chrome, Microsoft Edge, Firefox, Brave).
2. The entire system will boot up instantly with interactive charts, demo database, role switcher, and billing engine simulation.

### Optional: Run with Node.js / Vite
```bash
npm install
npm run dev
```

---

## 🎬 Demo Script (5-Minute Presentation)

1. **Overview Dashboard**: Highlight real-time **MRR ($48,250)**, **ARR ($579,000)**, active contracts, and recent revenue charts.
2. **Product Catalog**: Open *Products & Plans* to showcase product variants (demonstrating the Odoo variant with +$560 price increase).
3. **Quotation Pipeline**: Go to *Quotations*, view proposal `QUO-2026-012`, and click **"Convert to Subscription"**. Show how it moves seamlessly to *Active* status.
4. **Automated Billing Engine**: Click the **"Run Billing Job"** button. Point out the toast notification confirming exactly-once generation with zero duplicate invoices.
5. **Invoice & PDF Preview**: Open invoice `INV-2026-001`, click the **Printer icon** to demonstrate the formal, printable invoice.
6. **Payment Recording**: Settle overdue invoice `INV-2026-003` with a $531 payment. Watch it flip from Overdue to Paid.
7. **Role-Based Portal**: Use the **Role Switcher** in the sidebar to switch to *Customer Portal* mode. Show how customers only see their personal contracts and invoices.

---

## 👥 Team Members

| Name | Role | Responsibilities | GitHub / Contact |
|---|---|---|---|
| **Dipak Pal** | Project Lead / Fullstack | Architecture, Data Models & Repository Owner | [`officialdipakpal-lab`](https://github.com/officialdipakpal-lab) |
| **Shivam Yadav** | Fullstack Contributor | Specification, Backend APIs & Subscriptions | [`Shivam-Yadav7524`](https://github.com/Shivam-Yadav7524) / `shivambw3011@gmail.com` |
| **Vijay Sharma** | Frontend Specialist | UI/UX Design, Components & Responsive Layout | [`sharmavijay95111-cell`](https://github.com/sharmavijay95111-cell) |

---

<p align="center"><b>Brightloop Software: Because recurring revenue should run itself.</b></p>
