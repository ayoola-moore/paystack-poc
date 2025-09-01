import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Checkout from './Checkout'
import PaymentCallback from './PaymentCallback'
import OrderStatus from './OrderStatus'
import AdminPanel from './AdminPanel'

function App() {
  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <h1>🛒 Grundy Marketplace</h1>
          <p>Paystack Integration POC</p>
        </div>
      </header>
      
      <div className="container">
        <Routes>
          <Route path="/" element={<Checkout />} />
          <Route path="/callback" element={<PaymentCallback />} />
          <Route path="/order/:orderId" element={<OrderStatus />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </div>
  )
}

export default App