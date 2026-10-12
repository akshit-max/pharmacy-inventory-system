
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

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/medicines" element={<ProtectedRoute><Medicines /></ProtectedRoute>} />
        <Route path="/medicines/add" element={<ProtectedRoute><MedicineForm /></ProtectedRoute>} />
        <Route path="/medicines/:id/edit" element={<ProtectedRoute><MedicineForm /></ProtectedRoute>} />
        <Route path="/addmedicine" element={<ProtectedRoute><MedicineForm /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
        <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
        <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
        <Route path="/audit-trail" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><ReorderRecommendations /></ProtectedRoute>} />
        <Route path="/expiry-risks" element={<ProtectedRoute><ExpiryRisks /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
