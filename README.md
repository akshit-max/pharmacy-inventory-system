# 💊 Pharmacy Inventory Management System

A full-stack **MERN-based Pharmacy Inventory Management System** designed to provide an efficient, secure, and centralized platform for managing pharmacy inventory, stock levels, suppliers, and daily sales/purchase operations.

---

## 📌 Project Description

The **Pharmacy Inventory Management System** is a web-based application developed using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)**. 

The system helps pharmacies digitize routine management tasks, monitor stock thresholds, prevent financial loss through automated expiry tracking, record purchase/sales transactions, and maintain granular supplier directories.

---

## 🎯 Aim & Objectives

### Aim
To develop a production-ready, secure, and centralized web platform for end-to-end pharmacy inventory oversight and operational automation.

### Key Objectives
* **Centralize Records:** Consolidate medicine catalogs, batches, and supplier records in one database.
* **Stock & Threshold Monitoring:** Provide real-time inventory tracking with automated low-stock warnings.
* **Expiry Date Tracking:** Identify expired and near-expiry batches to minimize drug wastage.
* **Transaction Lifecycle:** Automate stock-in (purchases) and stock-out (sales) inventory adjustments.
* **Access Control:** Implement robust JWT-based authentication and Role-Based Access Control (RBAC).
* **Operational Visibility:** Deliver analytical dashboards displaying critical inventory metrics.

---

## ✨ Features

### 🔐 Authentication & Security
* JSON Web Token (JWT) authentication for stateless session verification.
* Role-Based Access Control (**Admin**, **Pharmacist**, **Cashier**).
* Bcrypt password hashing and input sanitization.
* Protected API routes and route guards on the frontend.

### 💊 Medicine & Batch Management
* Full CRUD operations for medicine records (Brand, Generic Name, Category, Dosage).
* Multi-batch tracking per medicine with distinct manufacturing and expiry dates.
* Dynamic search, multi-parameter filtering, and pagination.

### 📦 Inventory & Expiry Control
* Automated stock increment on purchase orders and decrement on sales.
* Real-time categorization of stock status: **In Stock**, **Low Stock**, and **Out of Stock**.
* Visual indicators and filters for expired items and batches expiring within 30/60/90 days.

### 🛒 Purchases, Sales & Supplier Management
* Supplier directory containing contact records, order history, and active contracts.
* Purchase order creation linked directly to batch updates.
* Point-of-sale transaction processing with automated bill calculation and receipt data generation.

### 📊 Real-Time Analytics Dashboard
* Summary KPI cards: Total Medicines, Stock Valuation, Low Stock Alerts, Expired Units.
* Revenue vs. Purchase expense overviews.
* Fast-moving vs. slow-moving stock distribution.

---

## 🏗️ System Architecture

```text
 ┌─────────────────────────────────────────────────────────┐
 │                   Client Layer (Browser)                │
 │       React.js | Tailwind CSS / Material UI | Axios      │
 └────────────────────────────┬────────────────────────────┘
                              │
                        HTTPS / JSON
                              │
 ┌────────────────────────────▼────────────────────────────┐
 │               Application Layer (Node/Express)          │
 │  ┌───────────────────────────────────────────────────┐  │
 │  │      Middleware: Auth (JWT), RBAC, Validation      │  │
 │  └─────────────────────────┬─────────────────────────┘  │
 │  ┌─────────────────────────▼─────────────────────────┐  │
 │  │    Controllers: Auth, Medicines, Stock, Sales     │  │
 │  └─────────────────────────┬─────────────────────────┘  │
 └────────────────────────────┼────────────────────────────┘
                              │
                      Mongoose ODM Driver
                              │
 ┌────────────────────────────▼────────────────────────────┐
 │                  Data Layer (MongoDB)                   │
 │  Collections: Users, Medicines, Batches, Orders, Logs   │
 └─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js (v18+), Vite | Component-driven Single Page Application |
| **Routing & State** | React Router v6, Context API / Redux Toolkit | Client-side routing and global application state |
| **Styling** | Tailwind CSS / CSS Modules | Responsive UI design |
| **Backend** | Node.js, Express.js | REST API development and server runtime |
| **Database** | MongoDB Atlas / Local MongoDB | NoSQL document storage |
| **ODM** | Mongoose | Schema definitions and database modeling |
| **Security** | JWT, Bcrypt.js, CORS, Helmet | Token authentication, hashing, and HTTP security |
| **Tooling** | Postman, Git, VS Code | API testing, version control, and development |

---

## 📂 Project Structure

```text
pharmacy-inventory-system/
├── client/                     # Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Images, icons, static assets
│   │   ├── components/         # Reusable UI components (Navbar, Sidebar, Modals)
│   │   ├── context/            # Auth and Global State Contexts
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── pages/              # Routed Views (Dashboard, Inventory, POS, etc.)
│   │   ├── services/           # Axios instance and API service calls
│   │   ├── utils/              # Formatters and date helper functions
│   │   ├── App.jsx             # Route definitions
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API Server
│   ├── config/                 # DB connection and environment loader
│   ├── controllers/            # Route handlers & core business logic
│   ├── middleware/             # JWT auth, error handler, role verification
│   ├── models/                 # Mongoose schemas (User, Medicine, Sale, etc.)
│   ├── routes/                 # REST endpoint route registrations
│   ├── services/               # Reusable business functions (e.g., stock calculations)
│   ├── utils/                  # Helper utilities and custom error classes
│   ├── server.js               # Application bootstrap
│   └── package.json
│
├── docs/                       # Project Documentation & Architecture Diagrams
│   ├── SRS/
│   └── UML/
│
├── .env.example                # Global template environment file
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Register a new system user *(Admin only)*
* `POST /api/auth/login` - Authenticate credentials and return JWT
* `GET /api/auth/profile` - Retrieve current authenticated user profile

### Medicines (`/api/medicines`)
* `GET /api/medicines` - Fetch paginated medicine list with search/filter queries
* `POST /api/medicines` - Add a new medicine record
* `GET /api/medicines/:id` - Fetch details for a specific medicine
* `PUT /api/medicines/:id` - Update existing medicine information
* `DELETE /api/medicines/:id` - Soft-delete / Remove a medicine record

### Inventory & Stock (`/api/inventory`)
* `GET /api/inventory/summary` - Fetch dashboard metrics (total, low stock, expired)
* `GET /api/inventory/low-stock` - Retrieve items below threshold
* `GET /api/inventory/expiring-soon` - Retrieve batches nearing expiration date
* `POST /api/inventory/adjust` - Manual stock adjustment with audit reason

### Transactions (`/api/purchases` & `/api/sales`)
* `POST /api/purchases` - Record supplier purchase and increment batch stocks
* `GET /api/purchases` - List historical purchase orders
* `POST /api/sales` - Record customer checkout and decrement inventory
* `GET /api/sales` - List historical sales receipts

---

## ⚙️ Installation & Local Setup

### Prerequisites
* **Node.js** (v18.x or higher)
* **npm** (v9.x or higher)
* **MongoDB** (Local instance or MongoDB Atlas account)
* **Git**

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/pharmacy-inventory-system.git
cd pharmacy-inventory-system
```

### Step 2: Configure Environment Variables

1. Inside the `server/` directory, create a `.env` file:
   ```bash
   cd server
   touch .env
   ```
2. Populate `server/.env` with your credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/pharmacy_db
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```

3. Inside the `client/` directory, create a `.env` file:
   ```bash
   cd ../client
   touch .env
   ```
4. Populate `client/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

### Step 3: Install Dependencies

Open two separate terminal tabs:

* **Terminal 1 (Backend):**
  ```bash
  cd server
  npm install
  ```

* **Terminal 2 (Frontend):**
  ```bash
  cd client
  npm install
  ```

### Step 4: Run the Application

* **Start Backend:**
  ```bash
  cd server
  npm run dev
  # Server running at: http://localhost:5000
  ```

* **Start Frontend:**
  ```bash
  cd client
  npm run dev
  # Client running at: http://localhost:5173
  ```

---

## 📋 Scope of the Project

| In Scope | Out of Scope |
| :--- | :--- |
| Role-based access control & security | Online e-commerce medicine delivery |
| Batch & expiry date tracking | Direct insurance claim processing |
| Purchase and sales stock automation | Multi-branch warehouse sync |
| Low-stock threshold alerts | In-app payment gateway integrations |
| Supplier directory & order logging | Patient clinical health records |

---

## 🔄 Version Control Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/medicine-crud-module
   ```
2. Commit changes with standard conventional commit syntax:
   ```bash
   git add .
   git commit -m "feat(inventory): add batch expiry validation middleware"
   ```
3. Push to your branch and open a Pull Request:
   ```bash
   git push origin feature/medicine-crud-module
   ```

---

## 👥 Project Team

| Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Contributor 1** | Project Lead / Architect | System design, database schemas, project milestones |
| **Contributor 2** | Backend Developer | Express REST APIs, Mongoose queries, authentication |
| **Contributor 3** | Frontend Developer | React interfaces, state management, API integration |
| **Contributor 4** | QA & Documentation | Test suites, Postman documentation, SRS/UML specs |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
