const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database simulation
const orders = new Map();
const transactions = new Map();

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Helper function to make Paystack API calls
const paystackAPI = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `${PAYSTACK_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Paystack API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Routes

// Flow A: Standard "Pay Now" Checkout
app.post('/checkout', async (req, res) => {
  try {
    const { cart, customerInfo, method = 'standard' } = req.body;
    
    // Calculate total amount (in kobo for Paystack)
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 100;
    
    // Create order record
    const orderId = uuidv4();
    const order = {
      id: orderId,
      cart,
      customerInfo,
      method,
      totalAmount: totalAmount / 100, // Store in naira
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    orders.set(orderId, order);
    
    // Initialize Paystack transaction
    const transactionData = {
      amount: totalAmount,
      email: customerInfo.email,
      reference: orderId,
      callback_url: `${process.env.FRONTEND_URL}/callback`,
      metadata: {
        orderId,
        method,
        customerInfo
      }
    };
    
    // For Pay on Delivery, restrict to card channel only
    if (method === 'POD') {
      transactionData.channels = ['card'];
    }
    
    const response = await paystackAPI('/transaction/initialize', 'POST', transactionData);
    
    // Store transaction reference
    transactions.set(orderId, {
      reference: orderId,
      authorization_url: response.data.authorization_url,
      method,
      status: 'initialized'
    });
    
    res.json({
      success: true,
      authorization_url: response.data.authorization_url,
      reference: orderId
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize checkout',
      error: error.message
    });
  }
});

// Standard payment callback
app.get('/callback', async (req, res) => {
  try {
    const { reference } = req.query;
    
    if (!reference) {
      return res.status(400).json({ success: false, message: 'Reference required' });
    }
    
    // Verify transaction with Paystack
    const verification = await paystackAPI(`/transaction/verify/${reference}`);
    
    if (verification.data.status === 'success') {
      // Update order status
      const order = orders.get(reference);
      if (order) {
        order.status = 'paid';
        order.paidAt = new Date().toISOString();
        orders.set(reference, order);
        
        // Trigger order fulfillment
        await triggerOrderFulfillment(reference);
      }
      
      // Update transaction
      const transaction = transactions.get(reference);
      if (transaction) {
        transaction.status = 'success';
        transaction.verifiedAt = new Date().toISOString();
        transactions.set(reference, transaction);
      }
    }
    
    res.json({
      success: true,
      status: verification.data.status,
      reference,
      order: orders.get(reference)
    });
    
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

// Pay on Delivery callback
app.get('/pod-callback', async (req, res) => {
  try {
    const { auth_code, reference } = req.query;
    
    if (!auth_code || !reference) {
      return res.status(400).json({ 
        success: false, 
        message: 'Authorization code and reference required' 
      });
    }
    
    // Update order status to authorized
    const order = orders.get(reference);
    if (order) {
      order.status = 'authorized';
      order.authorizationCode = auth_code;
      order.authorizedAt = new Date().toISOString();
      orders.set(reference, order);
      
      // Trigger order fulfillment
      await triggerOrderFulfillment(reference);
    }
    
    res.json({
      success: true,
      status: 'authorized',
      reference,
      order: orders.get(reference)
    });
    
  } catch (error) {
    console.error('POD Callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process authorization',
      error: error.message
    });
  }
});

// Simulate delivery confirmation
app.post('/delivery/confirm', async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = orders.get(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.method === 'POD' && order.status === 'authorized') {
      // Charge the authorized payment
      const chargeData = {
        authorization_code: order.authorizationCode,
        email: order.customerInfo.email,
        amount: order.totalAmount * 100 // Convert to kobo
      };
      
      const chargeResponse = await paystackAPI('/transaction/charge_authorization', 'POST', chargeData);
      
      if (chargeResponse.data.status === 'success') {
        order.status = 'completed';
        order.chargedAt = new Date().toISOString();
        orders.set(orderId, order);
      }
    } else if (order.method === 'standard' && order.status === 'paid') {
      order.status = 'completed';
      order.completedAt = new Date().toISOString();
      orders.set(orderId, order);
    }
    
    res.json({
      success: true,
      order: orders.get(orderId)
    });
    
  } catch (error) {
    console.error('Delivery confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm delivery',
      error: error.message
    });
  }
});

// Get order status
app.get('/order/:orderId', (req, res) => {
  const { orderId } = req.params;
  const order = orders.get(orderId);
  
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  
  res.json({
    success: true,
    order
  });
});

// List all orders (for testing)
app.get('/orders', (req, res) => {
  const allOrders = Array.from(orders.values());
  res.json({
    success: true,
    orders: allOrders
  });
});

// Helper function to simulate order fulfillment
async function triggerOrderFulfillment(orderId) {
  console.log(`🚀 Triggering order fulfillment for order: ${orderId}`);
  
  // Simulate assigning to rider
  setTimeout(() => {
    console.log(`🏍️ Order ${orderId} assigned to rider`);
  }, 1000);
  
  // In a real implementation, this would:
  // 1. Find available riders
  // 2. Assign the order
  // 3. Send notifications
  // 4. Track delivery progress
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Grundy Server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Grundy Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});