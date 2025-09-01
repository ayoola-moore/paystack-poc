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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { reference } = req.query;
    
    if (!reference) {
      return res.status(400).json({ success: false, message: 'Reference required' });
    }

    if (!PAYSTACK_SECRET_KEY) {
      console.error('PAYSTACK_SECRET_KEY not found in environment variables');
      return res.status(500).json({ success: false, message: 'Payment service configuration error' });
    }
    
    console.log('Verifying payment for reference:', reference);
    
    // Verify transaction with Paystack
    const verification = await paystackAPI(`/transaction/verify/${reference}`);
    
    console.log('Paystack verification response:', verification);
    
    if (verification.data.status === 'success') {
      // Create a mock order if it doesn't exist (since we don't have shared storage between API endpoints)
      let order = orders.get(reference);
      if (!order) {
        // Create a basic order from Paystack data
        order = {
          id: reference,
          customerInfo: {
            name: verification.data.customer?.first_name || 'Customer',
            email: verification.data.customer?.email || verification.data.metadata?.email || 'unknown@email.com'
          },
          method: 'standard',
          totalAmount: verification.data.amount / 100, // Convert from cents to rands
          status: 'paid',
          paidAt: new Date().toISOString(),
          createdAt: verification.data.created_at || new Date().toISOString(),
          cart: verification.data.metadata?.cart || []
        };
        orders.set(reference, order);
      } else {
        // Update existing order
        order.status = 'paid';
        order.paidAt = new Date().toISOString();
        orders.set(reference, order);
      }
      
      // Update transaction
      const transaction = transactions.get(reference) || {};
      transaction.status = 'success';
      transaction.verifiedAt = new Date().toISOString();
      transactions.set(reference, transaction);
      
      console.log('Payment verified successfully for order:', order.id);
    }
    
    res.json({
      success: verification.data.status === 'success',
      status: verification.data.status,
      reference,
      order: orders.get(reference),
      message: verification.data.status === 'success' ? 'Payment verified successfully' : 'Payment verification failed'
    });
    
  } catch (error) {
    console.error('Callback error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
