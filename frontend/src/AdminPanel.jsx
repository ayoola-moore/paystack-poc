import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function AdminPanel() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrders()
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders`)
      if (response.data.success) {
        setOrders(response.data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  const confirmDelivery = async (orderId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/delivery/confirm`, { orderId })
      if (response.data.success) {
        fetchOrders() // Refresh the list
      }
    } catch (error) {
      console.error('Error confirming delivery:', error)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <h2>Loading orders...</h2>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>🏪 Admin Panel - Order Management</h2>
          <button className="btn btn-primary" onClick={fetchOrders}>
            Refresh
          </button>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        {orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            No orders found. Create some orders from the main checkout page.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Method</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Created</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>
                      <code style={{ fontSize: '12px' }}>{order.id.slice(0, 8)}...</code>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{order.customerInfo.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{order.customerInfo.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: order.method === 'POD' ? '#fff3cd' : '#d4edda',
                        color: order.method === 'POD' ? '#856404' : '#155724'
                      }}>
                        {order.method === 'POD' ? 'Pay on Delivery' : 'Pay Now'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                      ₦{order.totalAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span className={`status status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          className="btn btn-primary"
                          onClick={() => window.open(`/order/${order.id}`, '_blank')}
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          View
                        </button>
                        
                        {(order.status === 'paid' || order.status === 'authorized') && (
                          <button 
                            className="btn btn-warning"
                            onClick={() => confirmDelivery(order.id)}
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            Confirm Delivery
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="card">
          <h3 style={{ margin: '0 0 12px 0' }}>📊 Total Orders</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
            {orders.length}
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ margin: '0 0 12px 0' }}>💰 Total Revenue</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
            ₦{orders
              .filter(order => order.status === 'completed' || order.status === 'paid')
              .reduce((sum, order) => sum + order.totalAmount, 0)
              .toLocaleString()}
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ margin: '0 0 12px 0' }}>📦 Pending Orders</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>
            {orders.filter(order => order.status === 'pending' || order.status === 'authorized').length}
          </div>
        </div>
        
        <div className="card">
          <h3 style={{ margin: '0 0 12px 0' }}>✅ Completed</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
            {orders.filter(order => order.status === 'completed').length}
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="card">
        <h3>📊 Payment Method Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>💳 Pay Now</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {orders.filter(order => order.method === 'standard').length} orders
            </div>
            <div style={{ color: '#666' }}>
              ₦{orders
                .filter(order => order.method === 'standard')
                .reduce((sum, order) => sum + order.totalAmount, 0)
                .toLocaleString()} total
            </div>
          </div>
          
          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>🚚 Pay on Delivery</h4>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {orders.filter(order => order.method === 'POD').length} orders
            </div>
            <div style={{ color: '#666' }}>
              ₦{orders
                .filter(order => order.method === 'POD')
                .reduce((sum, order) => sum + order.totalAmount, 0)
                .toLocaleString()} total
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
