import React, { useState } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Sample marketplace items
const sampleItems = [
  { id: 1, name: 'Fresh Tomatoes', price: 500, category: 'Vegetables' },
  { id: 2, name: 'Rice (5kg)', price: 2500, category: 'Grains' },
  { id: 3, name: 'Chicken', price: 1800, category: 'Meat' },
  { id: 4, name: 'Plantain', price: 300, category: 'Fruits' },
  { id: 5, name: 'Bread', price: 400, category: 'Bakery' },
]

function Checkout() {
  const [cart, setCart] = useState([])
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    phone: '',
    name: '',
    address: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('standard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        customerInfo,
        method: paymentMethod
      }
      
      const response = await axios.post(`${API_BASE_URL}/checkout`, checkoutData)
      
      if (response.data.success) {
        // Redirect to Paystack payment page
        window.location.href = response.data.authorization_url
      } else {
        setError('Failed to initialize checkout')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setError(error.response?.data?.message || 'Failed to process checkout')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Marketplace Items */}
      <div className="card">
        <h2>🏪 Marketplace Items</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {sampleItems.map(item => (
            <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
              <h4>{item.name}</h4>
              <p style={{ color: '#666', margin: '4px 0' }}>{item.category}</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>₦{item.price.toLocaleString()}</p>
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
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
            Your cart is empty. Add some items from the marketplace above.
          </p>
        ) : (
          <>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>{item.name}</h4>
                  <p style={{ margin: 0, color: '#666' }}>₦{item.price.toLocaleString()} each</p>
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
                  ₦{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
            
            <div style={{ borderTop: '2px solid #333', paddingTop: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>₦{getTotalAmount().toLocaleString()}</span>
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

      {/* Payment Method Selection */}
      <div className="card">
        <h2>💳 Payment Method</h2>
        <div className="payment-method">
          <div 
            className={`method-card ${paymentMethod === 'standard' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('standard')}
          >
            <h3>💳 Pay Now</h3>
            <p>Pay immediately using card, bank transfer, or USSD</p>
            <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '14px', color: '#666' }}>
              <li>Instant payment processing</li>
              <li>All payment channels available</li>
              <li>Immediate order fulfillment</li>
            </ul>
          </div>
          
          <div 
            className={`method-card ${paymentMethod === 'POD' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('POD')}
          >
            <h3>🚚 Pay on Delivery</h3>
            <p>Authorize your card now, pay when delivered</p>
            <ul style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '14px', color: '#666' }}>
              <li>Card authorization (no charge yet)</li>
              <li>Payment on successful delivery</li>
              <li>Guaranteed payment protection</li>
            </ul>
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
            background: loading ? '#6c757d' : (paymentMethod === 'POD' ? '#ffc107' : '#28a745')
          }}
        >
          {loading ? (
            '⏳ Processing...'
          ) : paymentMethod === 'POD' ? (
            `🔒 Authorize Card for ₦${getTotalAmount().toLocaleString()}`
          ) : (
            `💳 Pay ₦${getTotalAmount().toLocaleString()} Now`
          )}
        </button>
        
        {paymentMethod === 'POD' && (
          <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginTop: '8px' }}>
            Your card will be authorized but not charged until delivery is confirmed
          </p>
        )}
      </div>
    </div>
  )
}

export default Checkout