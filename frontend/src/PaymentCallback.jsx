import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function PaymentCallback({ type = 'standard' }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [orderData, setOrderData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const processCallback = async () => {
      try {
        const reference = searchParams.get('reference')
        const authCode = searchParams.get('authorization_code')
        
        if (!reference) {
          setError('No reference found in callback')
          setStatus('error')
          return
        }

        let response
        if (type === 'pod') {
          // Pay on Delivery callback
          response = await axios.get(`${API_BASE_URL}/pod-callback`, {
            params: { auth_code: authCode, reference }
          })
        } else {
          // Standard payment callback
          response = await axios.get(`${API_BASE_URL}/callback`, {
            params: { reference }
          })
        }

        if (response.data.success) {
          setOrderData(response.data.order)
          setStatus('success')
        } else {
          setError('Payment verification failed')
          setStatus('error')
        }
      } catch (error) {
        console.error('Callback error:', error)
        setError(error.response?.data?.message || 'Failed to process payment')
        setStatus('error')
      }
    }

    processCallback()
  }, [searchParams, type])

  const getStatusMessage = () => {
    if (type === 'pod') {
      return {
        title: '🔒 Card Authorized Successfully',
        subtitle: 'Your payment method has been authorized for Pay on Delivery',
        description: 'Your card will only be charged after successful delivery of your order.'
      }
    }
    return {
      title: '✅ Payment Successful',
      subtitle: 'Your payment has been processed successfully',
      description: 'Your order is now being prepared for delivery.'
    }
  }

  if (status === 'loading') {
    return (
      <div className="card">
        <div className="loading">
          <div style={{ textAlign: 'center' }}>
            <h2>⏳ Processing Payment...</h2>
            <p>Please wait while we verify your payment</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>❌ Payment Failed</h2>
          <div className="error">{error}</div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/')}
            style={{ marginTop: '20px' }}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const statusMsg = getStatusMessage()

  return (
    <div>
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h1>{statusMsg.title}</h1>
          <h3 style={{ color: '#28a745', margin: '16px 0' }}>{statusMsg.subtitle}</h3>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px' }}>
            {statusMsg.description}
          </p>
          
          {orderData && (
            <div style={{ 
              background: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px', 
              textAlign: 'left',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <h4>Order Details</h4>
              <p><strong>Order ID:</strong> {orderData.id}</p>
              <p><strong>Customer:</strong> {orderData.customerInfo.name}</p>
              <p><strong>Email:</strong> {orderData.customerInfo.email}</p>
              <p><strong>Total Amount:</strong> ₦{orderData.totalAmount.toLocaleString()}</p>
              <p><strong>Payment Method:</strong> {orderData.method === 'POD' ? 'Pay on Delivery' : 'Pay Now'}</p>
              <p>
                <strong>Status:</strong> 
                <span className={`status status-${orderData.status}`}>
                  {orderData.status}
                </span>
              </p>
            </div>
          )}
          
          <div style={{ marginTop: '30px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/order/${orderData?.id}`)}
            >
              Track Order
            </button>
            <button 
              className="btn btn-success"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="card">
        <h3>🚀 What happens next?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
            <h4>Order Preparation</h4>
            <p style={{ color: '#666' }}>Your order is being prepared by the marketplace vendor</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏍️</div>
            <h4>Rider Assignment</h4>
            <p style={{ color: '#666' }}>A delivery rider will be assigned to your order</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚚</div>
            <h4>Delivery</h4>
            <p style={{ color: '#666' }}>
              {type === 'pod' 
                ? 'Pay when your order arrives safely'
                : 'Your order will be delivered to your address'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentCallback
