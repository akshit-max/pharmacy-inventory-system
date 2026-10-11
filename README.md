# PharmaSys - Pharmacy Inventory Management System

A full-stack pharmacy management application built with the MERN stack for managing inventory, purchases, sales, suppliers, medicine records, and analytics in a secure, role-based workflow.

This project is designed for pharmacy operations where stock accuracy, expiry control, purchase tracking, and audit visibility are critical. It includes a React frontend, an Express backend, and MongoDB data models for medicines, batches, suppliers, purchases, sales, and user activity logs.

## Overview

PharmaSys helps pharmacies streamline day-to-day operations by providing:

- Medicine catalog management
- Batch-wise inventory tracking
- Purchase and sales workflows
- Supplier management
- Expiry risk monitoring
- Reorder recommendations
- Role-based access control
- Dashboard and analytics
- Audit trail for operational transparency

## Features

### Inventory Management
- Add, edit, and view medicines
- Manage item category, dose, manufacturer, and safety stock
- Track inventory by physical stock batches
- Monitor expired, low-stock, and near-expiry items

### Purchase & Sales Workflow
- Record and manage supplier purchases
- Create sales transactions with stock validation
- Prevent overselling and invalid stock deductions
- Maintain purchase/sale history linked to users and timestamps

### Expiry & Reorder Intelligence
- Identify expired and near-expiry stock
- Categorize batches based on expiry risk
- Estimate reorder points based on demand and lead time
- Highlight medicines that require replenishment

### Security & Access Control
- JWT-based authentication
- Role-based access for different user types
- Protected routes on the frontend
- Audit logging of transactions and changes

### Dashboard & Analytics
- Key metrics for sales, purchases, and inventory health
- Real-time operational overview
- Reorder recommendations page
- Expiry risk dashboard
- Transaction history and audit logs

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication & Security
- JWT
- bcryptjs
- CORS

## Architecture

The project follows a standard full-stack architecture:

- Frontend: React app for UI and route-based screens
- Backend: Express API server for business logic and data access
- Database: MongoDB for product, inventory, sales, and user data
- Auth: JWT verification on protected endpoints

## Project Structure

```bash
pharmacy-inventory-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── README.md
└── .gitignore
```

## Main Modules

### Backend APIs
The backend exposes routes for:

- Authentication
- Medicines
- Batches
- Suppliers
- Purchases
- Sales
- Inventory
- Stock movements
- Analytics

### Frontend Pages
- Login
- Dashboard
- Medicine catalog
- Add/edit medicine
- Inventory overview
- Purchase management
- Sales management
- Suppliers management
- Reorder recommendations
- Expiry risk monitoring
- Audit trail
- About page

## Prerequisites

Before running the project, make sure you have:

- Node.js v18 or later
- npm or yarn
- MongoDB instance or MongoDB Atlas cluster
- A `.env` file with required environment variables

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/akshit-max/pharmacy-inventory-system.git
cd pharmacy-inventory-system
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
JWT_SECRET=your_super_secret_key
```

Start the backend server:

```bash
npm start
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will usually run on:

```bash
http://localhost:5173
```

The backend is typically served at:

```bash
http://localhost:5000
```

## Environment Variables

### Backend
| Variable | Description |
| --- | --- |
| `PORT` | Port for the Express server |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT generation and verification |

## API Overview

### Authentication
- `POST /api/auth/login`

### Medicines
- `GET /api/medicines`
- `POST /api/medicines`
- `GET /api/medicines/:id`
- `PUT /api/medicines/:id`
- `DELETE /api/medicines/:id`

### Batches
- `GET /api/batches`
- `POST /api/batches`
- `GET /api/batches/:id`

### Suppliers
- `GET /api/suppliers`
- `POST /api/suppliers`
- `PUT /api/suppliers/:id`
- `DELETE /api/suppliers/:id`

### Purchases
- `POST /api/purchase`
- `GET /api/purchase`

### Sales
- `POST /api/sales`
- `GET /api/sales`

### Inventory & Analytics
- `GET /api/inventory`
- `GET /api/analytics/dashboard`
- `GET /api/analytics/reorder-recommendations`
- `GET /api/analytics/expiry-risks`

## Core Data Models

### User
Stores the user account, password hash, and role information for authentication and permissions.

### Medicine
Represents the master medicine catalog including name, category, safety stock, and product metadata.

### Batch
Represents the physical stock available for a medicine, including expiry date, quantity, purchase price, and batch relationships.

### Supplier
Stores supplier business details and contact information.

### Purchase
Tracks incoming stock purchases and is linked to a supplier and batches created from the purchase.

### Sale
Tracks outgoing sales, stock deduction, and related transaction metadata.

### StockMovement
Logs inventory movement for traceability and auditing.

## Usage Workflow

1. Create or import medicine data
2. Add supplier records
3. Record purchases to increase inventory stock
4. Monitor inventory and sales from the dashboard
5. Receive alerts for near-expiry or low-stock items
6. Generate reorder recommendations
7. Process sales while maintaining stock integrity and FEFO principles

## Security Considerations

- JWT tokens are stored on the client and used to authorize access
- Protected routes restrict unauthorized navigation
- Sensitive environment variables must not be committed to version control
- MongoDB credentials should be stored securely and rotated periodically

## Future Improvements

- Barcode scanner integration
- PDF invoice generation
- Email or SMS alerts for expiring stock
- Advanced reporting and export features
- Multi-branch inventory support
- Customer and prescription tracking

## Contributing

Contributions are welcome. To contribute:

```bash
git checkout -b feature/your-feature-name
git commit -m "Add your feature"
git push origin feature/your-feature-name
```

Then open a pull request for review.

## License

This project is currently licensed under the ISC License unless otherwise updated in the repository.

## Contact

If you want to discuss this project or extend it for a real-world pharmacy setup, feel free to reach out via the repository owner or project maintainer.

## Summary

PharmaSys is a practical pharmacy inventory and sales management system built for operational accuracy, stock safety, and business insight. It brings together product management, transaction tracking, user authentication, analytics, and inventory intelligence in a single MERN-based application.

---

If you want, I can also generate:
- a more professional GitHub-style README with badges and screenshots placeholders
- a simpler student-project README version
- a deployment-ready README for Render/Heroku/Vercel
- a README tailored specifically for college submission format
