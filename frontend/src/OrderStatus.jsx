import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function OrderStatus() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrderStatus()
    
    // Set up polling to check order status updates
    const interval = setInterval(fetchOrderStatus, 5000)
    
    return () => clearInterval(interval)
  }, [orderId])

  const fetchOrderStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/order/${orderId}`)
      if (response.data.success) {
        setOrder(response.data.order)
      } else {
        setError('Order not found')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError(error.response?.data?.message || 'Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }

  const simulateDeliveryConfirmation = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/delivery/confirm`, {
        orderId: order.id
      })
      
      if (response.data.success) {
        setOrder(response.data.order)
      }
    } catch (error) {
      console.error('Error confirming delivery:', error)
    }
  }

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: '📝' },
      { key: 'paid', label: order?.method === 'POD' ? 'Card Authorized' : 'Payment Confirmed', icon: '💳' },
      { key: 'authorized', label: 'Ready for Delivery', icon: '📦', showForPOD: true },
      { key: 'completed', label: 'Delivered', icon: '✅' }
    ]

    if (order?.method !== 'POD') {
      return steps.filter(step => !step.showForPOD)
    }
    return steps
  }

  const getStepStatus = (stepKey) => {
    if (!order) return 'pending'
    
    const statusOrder = ['pending', 'paid', 'authorized', 'completed']
    const currentIndex = statusOrder.indexOf(order.status)
    const stepIndex = statusOrder.indexOf(stepKey)
    
    if (stepIndex <= currentIndex) return 'completed'
    if (stepIndex === currentIndex + 1) return 'current'
    return 'pending'
  }

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <h2>Loading order details...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div>
      {/* Order Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2>📋 Order #{order.id.slice(0, 8)}</h2>
            <p style={{ color: '#666' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <span className={`status status-${order.status}`}>
            {order.status}
          </span>
        </div>

        {/* Progress Tracker */}
        <div style={{ margin: '30px 0' }}>
          <h3>📍 Order Progress</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
            {getStatusSteps().map((step, index) => {
              const stepStatus = getStepStatus(step.key)
              return (
                <div key={step.key} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: stepStatus === 'completed' ? '#28a745' : 
                               stepStatus === 'current' ? '#007bff' : '#e9ecef',
                    color: stepStatus === 'pending' ? '#6c757d' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginBottom: '8px'
                  }}>
                    {stepStatus === 'completed' ? '✓' : step.icon}
                  </div>
                  <span style={{ 
                    fontSize: '12px', 
                    textAlign: 'center',
                    color: stepStatus === 'pending' ? '#6c757d' : '#333',
                    fontWeight: stepStatus === 'current' ? 'bold' : 'normal'
                  }}>
                    {step.label}
                  </span>
                  
                  {index < getStatusSteps().length - 1 && (
                    <div style={{
                      position: 'absolute',
                      top: '25px',
                      left: '50%',
                      width: '100%',
                      height: '2px',
                      background: stepStatus === 'completed' ? '#28a745' : '#e9ecef',
                      zIndex: -1
                    }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="card">
        <h3>🛒 Order Items</h3>
        {order.cart.map(item => (
          <div key={item.id} className="cart-item">
            <div>
              <h4 style={{ margin: '0 0 4px 0' }}>{item.name}</h4>
              <p style={{ margin: 0, color: '#666' }}>₦{item.price.toLocaleString()} × {item.quantity}</p>
            </div>
            <div style={{ fontWeight: 'bold' }}>
              ₦{(item.price * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
        
        <div style={{ borderTop: '2px solid #333', paddingTop: '16px', marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}>
            <span>Total:</span>
            <span>₦{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Customer & Delivery Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3>👤 Customer Information</h3>
          <p><strong>Name:</strong> {order.customerInfo.name}</p>
          <p><strong>Email:</strong> {order.customerInfo.email}</p>
          <p><strong>Phone:</strong> {order.customerInfo.phone}</p>
          <p><strong>Address:</strong> {order.customerInfo.address}</p>
        </div>

        <div className="card">
          <h3>💳 Payment Information</h3>
          <p><strong>Method:</strong> {order.method === 'POD' ? 'Pay on Delivery' : 'Pay Now'}</p>
          <p><strong>Amount:</strong> ₦{order.totalAmount.toLocaleString()}</p>
          {order.method === 'POD' && order.status === 'authorized' && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#fff3cd', borderRadius: '4px' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                🔒 Your card is authorized. Payment will be processed upon delivery confirmation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Actions (for demo purposes) */}
      {(order.status === 'paid' || order.status === 'authorized') && (
        <div className="card">
          <h3>🚚 Delivery Simulation</h3>
          <p>In a real implementation, this would be handled by the delivery system.</p>
          <button 
            className="btn btn-warning"
            onClick={simulateDeliveryConfirmation}
          >
            Simulate Delivery Confirmation
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="card">
        <h3>📅 Order Timeline</h3>
        <div style={{ borderLeft: '2px solid #e9ecef', paddingLeft: '20px', marginLeft: '10px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 'bold' }}>Order Placed</div>
            <div style={{ color: '#666', fontSize: '14px' }}>
              {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
          
          {order.paidAt && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold' }}>Payment Confirmed</div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                {new Date(order.paidAt).toLocaleString()}
              </div>
            </div>
          )}
          
          {order.authorizedAt && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold' }}>Card Authorized</div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                {new Date(order.authorizedAt).toLocaleString()}
              </div>
            </div>
          )}
          
          {order.chargedAt && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold' }}>Payment Charged</div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                {new Date(order.chargedAt).toLocaleString()}
              </div>
            </div>
          )}
          
          {order.completedAt && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold' }}>Order Completed</div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                {new Date(order.completedAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderStatus
