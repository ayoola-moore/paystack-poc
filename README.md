# Paystack POC - Grundy Marketplace

A proof of concept implementation demonstrating Paystack API integration with two payment flows:
1. **Standard "Pay Now"** - Immediate payment processing
2. **"Pay on Delivery"** - Card authorization with charge on delivery confirmation

## 🏗️ Architecture

This POC follows the sequence diagram provided and implements:

- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Payment**: Paystack API integration
- **Database**: In-memory storage (for demo purposes)
- **Authentication**: AWS Amplify ready (basic config included)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Paystack account with test API keys
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd paystack-poc
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Paystack keys:
# PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
# PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Configure environment variables
# Edit .env with your settings:
# VITE_API_BASE_URL=http://localhost:3001
# VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Navigate to `http://localhost:5173` to start using the application.

## 📋 Features Implemented

### Flow A: Standard "Pay Now" Checkout
✅ Customer selects items and clicks "Checkout"  
✅ App sends cart and customer info to Grundy Server  
✅ Server initializes Paystack transaction with amount, email, subaccount, split_code  
✅ Paystack returns authorization_url  
✅ Customer redirected to Paystack payment page  
✅ Customer pays via Card, Bank, etc.  
✅ Paystack redirects to callback_url  
✅ Server verifies transaction with Paystack  
✅ Order status updated to "Paid"  
✅ Order fulfillment triggered  
✅ Automated payout processing (via Paystack splits)  

### Flow B: "Pay on Delivery" (Guaranteed)
✅ Customer selects "Pay on Delivery"  
✅ App sends cart with method: "POD"  
✅ Server initializes transaction with channels: ["card"]  
✅ Customer authorizes card (hold placed)  
✅ Authorization code captured  
✅ Order status updated to "Authorized"  
✅ Order fulfillment triggered  
✅ Delivery confirmation charges the authorized card  
✅ Order status updated to "Completed"  
✅ Automated payout processing  

## 🎯 API Endpoints

### Core Endpoints

- `POST /checkout` - Initialize payment for both flows
- `GET /callback` - Handle standard payment callback
- `GET /pod-callback` - Handle Pay on Delivery authorization
- `POST /delivery/confirm` - Confirm delivery and charge POD payments
- `GET /order/:orderId` - Get order status
- `GET /orders` - List all orders (admin)
- `GET /health` - Health check

## 🛠️ Testing the Flows

### Standard Payment Flow
1. Go to `http://localhost:5173`
2. Add items to cart
3. Fill customer information
4. Select "Pay Now"
5. Click checkout
6. Use Paystack test cards for payment
7. Verify payment confirmation

### Pay on Delivery Flow
1. Follow steps 1-3 above
2. Select "Pay on Delivery"
3. Click checkout
4. Authorize with test card (no charge)
5. Go to `/admin` panel
6. Simulate delivery confirmation
7. Verify payment is charged

### Test Cards (Paystack)
- **Successful payments**: `4084084084084081`
- **Insufficient funds**: `4094849999999994`
- **Failed payments**: `4111111111111112`

## 📱 User Interface

### Customer Interface
- **Marketplace** (`/`) - Browse and add items to cart
- **Checkout** - Select payment method and complete purchase
- **Payment Callback** (`/callback`, `/pod-callback`) - Payment confirmation
- **Order Tracking** (`/order/:id`) - Real-time order status

### Admin Interface
- **Admin Panel** (`/admin`) - Order management and delivery confirmation

## 🔐 Security Features

- Environment variable configuration
- API key protection
- CORS configuration
- Request validation
- Error handling

## 🏦 Payment Processing

### Paystack Integration
- Transaction initialization
- Payment verification
- Authorization code handling
- Split payment configuration
- Webhook support (extendable)

### Payment Methods Supported
- Card payments
- Bank transfers
- USSD payments
- QR code payments

## 📊 Order Management

### Order States
- `pending` - Order created, awaiting payment
- `paid` - Payment completed (standard flow)
- `authorized` - Card authorized (POD flow)
- `completed` - Order delivered and payment finalized

### Real-time Updates
- Order status polling
- Payment confirmation
- Delivery tracking
- Admin notifications

## 🌟 Additional Features

### AWS Amplify Integration Ready
- Basic Amplify configuration included
- Authentication can be easily added
- Scalable to full AWS infrastructure

### Responsive Design
- Mobile-friendly interface
- Clean, intuitive UI
- Progress tracking
- Status indicators

## 🚀 Production Considerations

### Database
- Replace in-memory storage with proper database (PostgreSQL, MongoDB)
- Implement data persistence
- Add indexes for performance

### Security
- Implement proper authentication
- Add rate limiting
- Input validation and sanitization
- HTTPS enforcement

### Scalability
- Add caching layer (Redis)
- Implement proper logging
- Add monitoring and alerts
- Database connection pooling

### Paystack Features
- Implement webhooks for real-time updates
- Add split payment configurations
- Implement recurring payments
- Add transaction export

## 🔧 Environment Variables

### Backend (.env)
```
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3001
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

## 📝 Development Notes

- Uses in-memory storage for simplicity
- All payments are in test mode
- Includes simulation features for delivery
- Real-time status updates via polling
- Comprehensive error handling
- Mobile-responsive design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.