import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [orderData, setOrderData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const processCallback = async () => {
      try {
        const reference = searchParams.get('reference')
        
        console.log('Processing callback with reference:', reference)
        console.log('API_BASE_URL:', API_BASE_URL)
        
        if (!reference) {
          setError('No reference found in callback URL')
          setStatus('error')
          return
        }

        // Standard payment callback
        console.log('Making request to:', `${API_BASE_URL}/callback`)
        const response = await axios.get(`${API_BASE_URL}/callback`, {
          params: { reference }
        })

        console.log('Callback response:', response.data)

        if (response.data.success) {
          setOrderData(response.data.order)
          setStatus('success')
        } else {
          setError(`Payment verification failed: ${response.data.message || 'Unknown error'}`)
          setStatus('error')
        }
      } catch (error) {
        console.error('Callback error:', error)
        console.error('Error response:', error.response)
        
        let errorMessage = 'Failed to process payment'
        
        if (error.response?.status === 404) {
          errorMessage = 'Callback API endpoint not found'
        } else if (error.response?.status >= 500) {
          errorMessage = 'Server error during payment verification'
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }
        
        setError(errorMessage)
        setStatus('error')
      }
    }

    processCallback()
  }, [searchParams])

  const getStatusMessage = () => {
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
              background: '#000', 
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
              <p><strong>Total Amount:</strong> R{orderData.totalAmount.toLocaleString()}</p>
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
              className="btn btn-success"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentCallback
