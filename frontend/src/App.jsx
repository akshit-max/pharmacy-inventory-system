import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Medicines from './pages/Medicines'
import MedicineForm from './pages/MedicineForm'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Sales from './pages/Sales'
import Suppliers from './pages/Suppliers'
import Purchases from './pages/Purchases'
import AuditTrail from './pages/AuditTrail'
import ReorderRecommendations from './pages/ReorderRecommendations'
import ExpiryRisks from './pages/ExpiryRisks'
import Login from './pages/Login'
import About from './pages/About'
import Signup from './pages/Signup'
import Users from './pages/Users'
import NotFound from './pages/NotFound'
import { getUser, isLoggedIn } from './utils/auth'

// Only show the page when logged in (and, if `roles` is given, only for those roles)
const ProtectedRoute = ({ children, roles }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }

  const user = getUser()
  if (roles && !roles.includes(user?.role)) {
    return <NotFound message="You do not have permission to open this page." />
  }

  return children
}

const ALL = ['Admin', 'Pharmacist', 'Cashier']
const STAFF = ['Admin', 'Pharmacist']
const ADMIN = ['Admin']

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Logged-in pages */}
        <Route path="/dashboard" element={<ProtectedRoute roles={ALL}><Dashboard /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute roles={ALL}><Inventory /></ProtectedRoute>} />
        <Route path="/medicines" element={<ProtectedRoute roles={ALL}><Medicines /></ProtectedRoute>} />
        <Route path="/medicines/add" element={<ProtectedRoute roles={STAFF}><MedicineForm /></ProtectedRoute>} />
        <Route path="/medicines/:id/edit" element={<ProtectedRoute roles={STAFF}><MedicineForm /></ProtectedRoute>} />
        <Route path="/addmedicine" element={<Navigate to="/medicines/add" replace />} />
        <Route path="/sales" element={<ProtectedRoute roles={ALL}><Sales /></ProtectedRoute>} />
        <Route path="/billing" element={<Navigate to="/sales" replace />} />
        <Route path="/purchases" element={<ProtectedRoute roles={STAFF}><Purchases /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute roles={STAFF}><Suppliers /></ProtectedRoute>} />
        <Route path="/audit-trail" element={<ProtectedRoute roles={STAFF}><AuditTrail /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute roles={STAFF}><ReorderRecommendations /></ProtectedRoute>} />
        <Route path="/expiry-risks" element={<ProtectedRoute roles={STAFF}><ExpiryRisks /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute roles={ADMIN}><Users /></ProtectedRoute>} />

        {/* Anything else */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
