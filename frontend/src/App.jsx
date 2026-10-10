import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Medicines from './pages/Medicines'
import MedicineForm from './pages/MedicineForm'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Sales from './pages/Sales'

function App() {
  return (
    <BrowserRouter>
      <Routes>
       <Route path="/" element={<Home />} />
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/medicines" element={<Medicines />} />
<Route path="/medicines/add" element={<MedicineForm />} />
<Route path="/medicines/:id/edit" element={<MedicineForm />} />
<Route path="/addmedicine" element={<MedicineForm />} />
<Route path="/inventory" element={<Inventory />} />
<Route path="/sales" element={<Sales />} />
<Route path="/billing" element={<Sales />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
