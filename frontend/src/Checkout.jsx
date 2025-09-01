import React, { useState } from 'react'
import axios from 'axios'

// Use current domain for API calls in production, localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.MODE === 'production' 
    ? `${window.location.origin}/api`
    : 'http://localhost:3001/api'
)

// Sample marketplace items with ZAR pricing
const sampleItems = [
  { id: 1, name: 'Fresh Tomatoes', price: 25, category: 'Vegetables' },
  { id: 2, name: 'Rice (5kg)', price: 120, category: 'Grains' },
  { id: 3, name: 'Chicken', price: 85, category: 'Meat' },
  { id: 4, name: 'Plantain', price: 15, category: 'Fruits' },
  { id: 5, name: 'Bread', price: 20, category: 'Bakery' },
]

function Checkout() {
  const [cart, setCart] = useState([])
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    phone: '',
    name: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPrice = (amount) => {
    return `R${amount.toLocaleString()}`
  }

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId)
    } else {
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handleCustomerInfoChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!customerInfo.email || !customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      setError('Please fill in all customer information fields')
      return false
    }
    if (cart.length === 0) {
      setError('Please add items to your cart')
      return false
    }
    return true
  }

  const handleCheckout = async () => {
    setError('')
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const checkoutData = {
        cart,
        customerInfo
      }
      
      console.log('Making checkout request to:', `${API_BASE_URL}/checkout`)
      console.log('Checkout data:', checkoutData)
      
      const response = await axios.post(`${API_BASE_URL}/checkout`, checkoutData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      })
      
      console.log('Checkout response:', response.data)
      
      if (response.data.success) {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url
      } else {
        setError('Failed to initialize checkout: ' + (response.data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Checkout error:', error)
      console.error('Error response:', error.response)
      
      if (error.code === 'ECONNABORTED') {
        setError('Request timeout - please try again')
      } else if (error.response?.status === 404) {
        setError('API endpoint not found - deployment issue')
      } else if (error.response?.status >= 500) {
        setError('Server error - please try again later')
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to process checkout')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="card">
        <h2>🛒 Grundy Marketplace</h2>
      </div>

      {/* Marketplace Items */}
      <div className="card">
        <h2>🏪 Products</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {sampleItems.map(item => (
            <div key={item.id} style={{ border: '1px solid #555', borderRadius: '8px', padding: '16px', backgroundColor: '#3d3d3d' }}>
              <h4 style={{ color: '#ffffff', margin: '0 0 8px 0' }}>{item.name}</h4>
              <p style={{ color: '#cccccc', margin: '4px 0' }}>{item.category}</p>
              <div style={{ margin: '8px 0' }}>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#198754', margin: '2px 0' }}>
                  {formatPrice(item.price)}
                </p>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => addToCart(item)}
                style={{ width: '100%' }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Shopping Cart */}
      <div className="card">
        <h2>🛒 Shopping Cart ({cart.length} items)</h2>
        {cart.length === 0 ? (
          <p style={{ color: '#cccccc', textAlign: 'center', padding: '20px' }}>
            Your cart is empty. Add some items from the marketplace above.
          </p>
        ) : (
          <>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#ffffff' }}>{item.name}</h4>
                  <p style={{ margin: 0, color: '#cccccc' }}>{formatPrice(item.price)} each</p>
                </div>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '40px', textAlign: 'center' }}>{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button 
                    className="btn"
                    onClick={() => removeFromCart(item.id)}
                    style={{ marginLeft: '8px', background: '#dc3545', color: 'white' }}
                  >
                    Remove
                  </button>
                </div>
                <div style={{ fontWeight: 'bold' }}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
            
            <div style={{ borderTop: '2px solid #555', paddingTop: '16px', marginTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #444' }}>
                <span>Total:</span>
                <span>{formatPrice(getTotalAmount())}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Customer Information */}
      <div className="card">
        <h2>👤 Customer Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              value={customerInfo.name}
              onChange={handleCustomerInfoChange}
              className="form-input"
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={customerInfo.email}
              onChange={handleCustomerInfoChange}
              className="form-input"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={customerInfo.phone}
              onChange={handleCustomerInfoChange}
              className="form-input"
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Delivery Address *</label>
            <input
              type="text"
              name="address"
              value={customerInfo.address}
              onChange={handleCustomerInfoChange}
              className="form-input"
              placeholder="Enter your delivery address"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && <div className="error">{error}</div>}

      {/* Checkout Button */}
      <div className="card">
        <button 
          className="btn btn-success"
          onClick={handleCheckout}
          disabled={loading || cart.length === 0}
          style={{ 
            width: '100%', 
            fontSize: '18px', 
            padding: '16px',
            background: loading ? '#6c757d' : '#198754'
          }}
        >
          {loading ? (
            '⏳ Processing...'
          ) : (
            ` Pay ${formatPrice(getTotalAmount())} Now`
          )}
        </button>
      </div>
    </div>
  )
}

export default Checkout