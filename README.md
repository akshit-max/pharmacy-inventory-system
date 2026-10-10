# 💊 PharmaSys - MERN Pharmacy Management System

A full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** web application built for a college minor project. This system moves beyond basic CRUD operations to demonstrate secure authentication, transactional integrity, intelligent inventory routing (FEFO), and transparent analytics.

---

## 📌 Project Overview
PharmaSys is designed to centralize pharmacy records and automate the flow of inventory. When purchases arrive, stock goes up. When sales occur, stock goes down. More importantly, it provides operational intelligence—identifying which medicines are running out based on real sales data, and alerting pharmacists to batches that are about to expire.

## ⚠️ Problem Statement
Pharmacies handle critical inventory with strict expiration dates. Traditional manual tracking leads to:
1. Selling expired medicine (Safety Risk).
2. Throwing away expired medicine (Financial Loss).
3. Running out of critical stock unexpectedly (Operational Failure).

PharmaSys solves these problems by strictly enforcing FEFO (First-Expire, First-Out) at the point of sale, providing demand-based reorder calculations, and proactively highlighting expiry risks.

---

## ✨ Key Features

### 🔐 Security & Access
* **Role-Based Access Control (RBAC):** Distinct permissions for Admin, Pharmacist, and Cashier.
* **JWT Authentication:** Secure, stateless session management.
* **Audit Trail:** Every purchase and sale strictly logs the user (`performedBy`) responsible for the action.

### 📦 Inventory Engine
* **MongoDB Transactions:** Purchases and Sales are wrapped in ACID transactions. If a sale fails halfway, no stock is deducted.
* **FEFO Routing:** The point-of-sale system automatically deducts stock from the batch expiring soonest, protecting profits.
* **Oversell Protection:** Concurrent sales attempting to buy more stock than available are blocked.

### 🧠 Analytics & Intelligence (No AI/ML)
* **Demand-Based Smart Reorders:** Calculates Average Daily Demand (last 30 days) and outputs a mathematically sound Reorder Point using Supplier Lead Times and Safety Stock.
* **Expiry-Risk Monitoring:** Scans the entire inventory to categorize batches into Expired, Critical (<7 days), High Risk (7-30 days), Upcoming (30-90 days), and Safe (>90 days), calculating the estimated financial value at risk.
* **Live Dashboard:** Real-time metrics for today's transactions and total eligible inventory.

---

## 🛠️ Technology Stack
* **Frontend:** React.js, Vite, Tailwind CSS, Axios, React Router.
* **Backend:** Node.js, Express.js.
* **Database:** MongoDB Atlas (Replica Set required for Transactions), Mongoose ODM.
* **Security:** Bcrypt (hashing), JSON Web Tokens (auth).

---

## 🏗️ System Architecture
The application uses a standard RESTful architecture. The React frontend communicates statelessly with the Express backend via JSON over HTTP. The backend enforces authentication via middleware before passing requests to the controller layer, which executes Mongoose queries inside isolated MongoDB Sessions.

---

## 🗄️ Database Models and Relationships
* **User:** Stores credentials and roles.
* **Medicine:** The master catalog (Name, Category, Safety Stock, Lead Time).
* **Batch:** Physical inventory instances linked to a Medicine. Tracks Quantity, Purchase Price, and Expiry Date.
* **Supplier:** Vendor information.
* **Purchase:** Incoming orders. Linked to Supplier. Creates new Batches.
* **Sale:** Outgoing orders. Decrements Batch quantities.
* **StockMovement:** An append-only audit log tracking exactly how many units were added or removed, why, and by whom.

---

## 🚀 Installation and Environment Configuration

### Prerequisites
* Node.js (v18+)
* MongoDB Atlas Cluster (Local standalone MongoDB **will not work** as it does not support transactions).

### 1. Backend Setup
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>
JWT_SECRET=your_super_secret_string
```
```bash
cd backend
npm install
node server.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints (Highlighted)
* `POST /api/auth/login` - Authenticate user
* `POST /api/purchases` - Create a purchase (Admin only, uses Transaction)
* `POST /api/sales` - Create a sale (Deducts stock via FEFO)
* `GET /api/analytics/dashboard` - Live KPI metrics
* `GET /api/analytics/reorder-recommendations` - Computes 30-day demand logic
* `GET /api/analytics/expiry-risks` - Categorizes impending batch expirations

---

## 🚧 Known Limitations & Future Scope
* **Limitations:** The Smart Reorder feature strictly requires 30 days of sales history; it does not account for seasonal spikes. The system does not currently integrate with barcode scanners.
* **Future Scope:** Automated email alerts for critical expiry risks and PDF invoice generation for sales.
