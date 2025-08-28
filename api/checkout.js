// In-memory database simulation (use external DB in production)
const orders = new Map();
const transactions = new Map();

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Helper function to make Paystack API calls using fetch
const paystackAPI = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      config.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${PAYSTACK_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Paystack API Error:', error.message);
    throw error;
  }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', false);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    console.log('Checkout request received:', req.body);
    
    const { cart, customerInfo, method = 'standard' } = req.body;
    
    // Validate input
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is required and must not be empty' });
    }
    
    if (!customerInfo || !customerInfo.email || !customerInfo.name) {
      return res.status(400).json({ success: false, message: 'Customer information is required' });
    }

    if (!PAYSTACK_SECRET_KEY) {
      console.error('PAYSTACK_SECRET_KEY not found in environment variables');
      return res.status(500).json({ success: false, message: 'Payment service configuration error' });
    }
    
    // Calculate total amount (in kobo for Paystack)
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 100;
    
    console.log('Total amount calculated:', totalAmount, 'kobo');
    
    // Create order record
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    console.log('Order created:', orderId);
    
    // Get frontend URL for callbacks
    const frontendUrl = `https://${req.headers.host}`;
    
    // Initialize Paystack transaction
    const transactionData = {
      amount: totalAmount,
      email: customerInfo.email,
      reference: orderId,
      callback_url: `${frontendUrl}/callback`,
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
    
    console.log('Initializing Paystack transaction:', transactionData);
    
    const response = await paystackAPI('/transaction/initialize', 'POST', transactionData);
    
    console.log('Paystack response:', response);
    
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
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to initialize checkout',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
