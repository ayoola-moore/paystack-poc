# Paystack POC Backend

Backend server for the Paystack proof of concept implementation.

## Features

- Paystack transaction initialization
- Payment verification
- Pay on delivery with card authorization
- Order management
- Delivery confirmation
- Split payment support

## API Endpoints

### Payment Flow
- `POST /checkout` - Initialize payment
- `GET /callback` - Payment verification callback
- `GET /pod-callback` - Pay on delivery callback

### Order Management
- `GET /order/:orderId` - Get order details
- `GET /orders` - List all orders
- `POST /delivery/confirm` - Confirm delivery

### Health Check
- `GET /health` - Server health status

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your Paystack keys:
```
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PORT=3001
FRONTEND_URL=http://localhost:5173
```

4. Run the server:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Environment Variables

- `PAYSTACK_SECRET_KEY` - Your Paystack secret key
- `PAYSTACK_PUBLIC_KEY` - Your Paystack public key  
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS
